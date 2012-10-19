var app = module.parent.exports.app
  , passport = require('passport')
  , redisClient = module.parent.exports.redisClient
  , config = require('../config')

app.get('/', function(req, res){
	res.render('index');
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
	passport.authenticate('github', {
		failureRedirect: '/failed',
		successRedirect: '/'
	})
);