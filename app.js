var express = require('express')
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
  , io = require('socket.io').listen(app);

var db = mongoose.createConnection('localhost', 'test');
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Mongo db connection established")
});

// Set up user schema and model

var userSchema = new mongoose.Schema({
  uid: Number,
  name: String,
  username: String,
  avatar: String
});

userSchema.statics.findOrCreate = function(data, done) {
  var that = this;
  var user = this.findOne({id: data.id}, 'name', function(err, user) {
    if (!user) {
      that.create(data, function(err, newuser) {
        done(null, newuser);
      });
    } else {
      done(null, user);
    }
  });
}

var User = db.model('User', userSchema);

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
        id: profile.id,
        name: profile.displayName,
        username: profile.username,
        avatar: profile._json.avatar_url
      }
      User.findOrCreate(data, done);
    });
  }
));

// Redis and session store setup

var redisClient = exports.redisClient = redis.createClient();
var sessionStore = exports.sessionStore = new RedisStore({client: redisClient});

// Create and configure express app

var app = exports.app = express();

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

app.listen(3000);
console.log('Listening on port 3000');