var express = require('express')
  , passport = require('passport')
  , GitHubStrategy = require('passport-github').Strategy
  , stylus = require('stylus')
  , nib = require('nib')
  , jade = require('jade')
  , ember = require('ember')
  , redis = require('redis')
  , RedisStore = require('connect-redis')(express)
  , io = require('socket.io').listen(app);

// Passport setup

var GITHUB_CLIENT_ID = "--insert-github-client-id-here--"
var GITHUB_CLIENT_SECRET = "--insert-github-client-secret-here--";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Redis and session store setup

var redisClient = redis.createClient();
var sessionStore = exports.sessionStore = new RedisStore({client: redisClient})

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
    src: __dirname + "/assets/stylesheets",
    dest: __dirname + "/public/stylesheets",
    compile: compile,
    force: true
  }));
  this.use(express.static(__dirname+'/public'));
  this.use(express.bodyParser());
  this.use(expresss.cookieParser());
  this.use(express.session({
    key: "codescribe",
    store: sessionStore
  }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(app.router);
});

require('./routes');

app.listen(3030);
console.log('Listening on port 3030');