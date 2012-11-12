var express = require('express')
  , app = exports.app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , config = require('./config.json')
  , passport = require('passport')
  , GitHubStrategy = require('passport-github').Strategy
  , stylus = require('stylus')
  , nib = require('nib')
  , jade = require('jade')
  , ember = require('ember')
  , mongo = require('mongodb')
  , mongoose = require('mongoose')
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , _ = require('underscore')
  , sioCookieParser = express.cookieParser("secretstring")
  , xmpp = require('node-xmpp');

var cl = new xmpp.Client({ jid: "codescribe@maxs-mbp",
                           password: "testing",
                           host: "localhost",
                           port: "5222"
                         });

cl.on('online', function() {
  console.log("Jabber client connected");

  // Update presence status to available
  cl.send(new xmpp.Element('presence', { type: 'available' }).
    c('show').t('chat')
   );

  // Join a room
  cl.send(new xmpp.Element('presence', { to: "room1@conference.maxs-mbp/codescribe" }).
    c('x', { xmlns: 'http://jabber.org/protocol/muc' })
  );
});

cl.on('stanza', function(stanza) {
  console.log(stanza);
  var body = stanza.getChild('body');
  if (!body) {
    return;
  }
  var message = body.getText();
  console.log(message);
});

// Mongo db connection instantiated

var db = mongoose.createConnection('localhost', 'test');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Mongo db connection established")
});

// Redis and session store setup

var redisClient = exports.redisClient = redis.createClient(),
    redisSubClient = exports.redisSubClient = redis.createClient(),
    sessionStore = exports.sessionStore = new RedisStore({client: redisClient});

// 

var utils = {
  verifyAlpha: function(str) {
    try {
      return check(str).isAlpha();
    } catch(e) {
      console.log(e.message);
      // Throw a new error
    }
  },
  sockets: {
    relayResponse:  function(err, data, type, fn) {
      if (err) return "Error";
      var obj = {
        success: true,
        json: {}
      };
      obj.json[type] = data;
      fn(obj);
    }
  }
};

// Socket listeners

io.sockets.on('connection', function (socket) {

  // Set current user id

  sioCookieParser(socket.handshake, {}, function(err) {
    sessionStore.get(socket.handshake.signedCookies['codescribe'], function(err, data) {
      socket.set('uid', data.passport.user, function() {});
    });
  });

  console.log("Socket connection established");

  // SOCKETAdapter listeners

  socket.on('createRecord', function (type, data, fn) {
    // Modify data if it is a message
    if (type == "Message") {
      socket.get('uid', function(err, uid) {
        data.user = uid;
      });
    }
    Model[type].create(data, function(err, data) {
      var execute = {
        Chat: function() {
          Model["Chat"].findById(data._id)
            .populate('participants')
            .exec(function(err, chat) {
              utils.sockets.relayResponse(err, chat, type, fn);
            });
        },
        Message: function() {
          // Add reference to chat model
          Model["Chat"].findById(data.chat_id)
            .populate('participants')
            .exec(function(err, chat) {
              chat.messages.push(data._id);
              chat.save();
            });
          utils.sockets.relayResponse(err, data, type, fn);
        }
      };
      execute[type]();
    });
  });

  socket.on('findAll', function (type, fn) {
    Model[type].find({})
      .populate('participants')
      .exec(function(err, data) {
        utils.sockets.relayResponse(err, data, type, fn);
      });
  });

  socket.on('find', function (type, id, fn) {
    Model[type].findById(id)
      .populate('participants')
      .exec(function(err, data) {
        console.log(data);
        utils.sockets.relayResponse(err, data, type, fn);
      });
  });

  // Message listeners

  socket.on('subscribe', function(data, fn) {
    redisSubClient.subscribe(data.id);
    redisSubClient.on('message', function(channel, json) {
      socket.emit(channel, json);
    });
    fn(data.id); // subscribe to the channel locally
  })

  socket.on('unsubscribe', function(data, fn) {
    redisSubClient.unsubscribe(data.id);
    redisSubClient.removeAllListeners('message');
    fn(data.id); // unsubscribe from the channel locally
  })

});

// Set up mongo schemas and models

var userSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  name: String,
  username: String,
  avatar: String
});

userSchema.statics.findOrCreate = function(data, done) {
  var that = this;
  var user = this.findOne({uid: data.uid}, 'name', function(err, user) {
    if (!user) {
      that.create(data, function(err, newuser) {
        return done(null, newuser);
      });
    } 
    done(null, user);
  });
}

var chatSchema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
}).post('save', function (model, err) {
    // Create a queue representing this chat in redis after save
});

var messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  time: { type: Date, default: Date.now },
  msg: String,
  chat_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
}).post('save', function (model, err) {
  // Post model to redis queue before save
  var json = JSON.stringify(this)
  redisClient.publish(this.chat_id, json);
});

var Model = {
  User: db.model('User', userSchema),
  Chat: db.model('Chat', chatSchema),
  Message: db.model('Message', messageSchema)
}

// Passport setup

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: config.auth.github.clientId,
    clientSecret: config.auth.github.clientSecret,
    callbackURL: config.auth.github.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      var data = {
        uid: profile.id,
        name: profile.displayName,
        username: profile.username,
        avatar: profile._json.avatar_url
      }
      Model.User.findOrCreate(data, done);
    });
  }
));

// Create and configure express app

app.configure(function() {
  this.set('view engine', 'jade');
  this.set('views', "views");
  function compile(str, path) {
    return stylus(str)
      .use(nib())
      .import('nib')
      .import(__dirname + '/assets/stylesheets/reset');
  }
  this.use(stylus.middleware({
    src: __dirname + "/assets",
    dest: __dirname + "/public",
    compile: compile,
    force: true,
    debug: true
  }));
  this.use(express.static(__dirname+'/public'));
  this.use(express.bodyParser());
  this.use(express.cookieParser('secretstring'));
  this.use(express.session({
    key: "codescribe",
    store: sessionStore
  }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(app.router);
});

require('./routes');

server.listen(3000);
console.log('Listening on port 3000');