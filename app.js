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
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , check = require('validator').check
  , sanitize = require('validator').sanitize
  , _ = require('underscore')
  , sioCookieParser = express.cookieParser("secretstring");

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Setup Redis and session store

var redisClient = exports.redisClient = redis.createClient(),
    redisSubClient = exports.redisSubClient = redis.createClient(),
    sessionStore = exports.sessionStore = new RedisStore({client: redisClient});

// Set up database (and models)

var db = require('./config/db')

// Configure express app

app.configure(function() {
  this.set('view engine', 'jade');
  this.set('views', "views");
  var paths = [
      __dirname + '/assets/stylesheets'
  ];
  function compile(str, path) {
    return stylus(str)
      .set('paths', paths)
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

// Set up passport

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
        avatar: profile._json.avatar_url,
        email: profile._json.email
      }
      db.user.findOrCreate(data, done);
    });
  }
));

// Load models, controllers, and routes

require('./config/boot')({ verbose: !module.parent });
require('./routes');

// Listen on 3000

server.listen(3000);
console.log('Listening on port 3000');