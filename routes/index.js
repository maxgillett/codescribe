var app = module.parent.exports.app
  , passport = require('passport')
  , redisClient = module.parent.exports.redisClient
  , config = require('../config')

// Publicly available routes
app.get('/', authorizeUser);

// Available only to authorized users
app.get('/teams*', ensureAuthenticated, authorizeUser);
app.get('/rooms/:id', ensureAuthenticated, authorizeUser);
app.get('/logout', ensureAuthenticated, function(req, res){
  req.logout();
  res.redirect('/');
});

// Authentication routes
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', 
	passport.authenticate('github', {
		failureRedirect: '/failed',
		successRedirect: '/teams'
	})
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

function authorizeUser(req, res) {
  var auth = req.session.passport.user ? "authorized" : false
  res.render('index', {auth: auth});
}
