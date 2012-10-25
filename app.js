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
  , sanitize = require('validator').sanitize;

var db = mongoose.createConnection('localhost', 'test');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Mongo db connection established")
});

var utils = {};

utils.verifyAlpha = function(str) {
  try {
    check(str).isAlpha();
  } catch(e) {
    console.log(e.message);
    return false
  }
};

io.sockets.on('connection', function (socket) {
  console.log("Socket connection established");

  socket.on('createRecord', function (type, data, fn) {
    var type = sanitize(type).ltrim("App."); 
    utils.verifyAlpha(type); 
    Model[type].create(data, function(err, chat) {
      if (err) return "Error";
      var response = {
        success: true,
        json: {
          chat: chat
        }
      }
      fn(response);
    });
  });

  socket.on('findAll', function (type, fn) {
    var type = sanitize(type).ltrim("App.");
    utils.verifyAlpha(type);
    Model[type].find({})
      .populate('participants')
      .exec(function(err, chats) {
        console.log(chats);
        if (err) return "Error";
        var response = {
          success: true,
          json: {
            chat: chats
          }
        }
        fn(response);
      });
  });

  socket.on('find', function (type, id, fn) {
    var type = sanitize(type).ltrim("App.");
    utils.verifyAlpha(type);
    Model[type].findById(id)
      .populate('participants')
      .exec(function(err, chat) {
        console.log(chat);
        if (err) return "Error";
        var response = {
          success: true,
          json: {
            chat: chat
          }
        }
        fn(response);
      });
  });

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
  messages: [messageSchema]
});

var messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  time: { type: Date, default: Date.now },
  content: String
});

var Model = {
  User: db.model('User', userSchema),
  Chat: db.model('Chat', chatSchema)
}

// Passport setup

passport.serializeUser(function(user, done) {
  done(null, user.id);
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

// Redis and session store setup

var redisClient = exports.redisClient = redis.createClient();
var sessionStore = exports.sessionStore = new RedisStore({client: redisClient});

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