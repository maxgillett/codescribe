var db = require('../../config/db')
  , async = require('async');

// Invites are a layer that sit on top of pendingUsers. 
// An invite ID is a pendingUser ID

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

}

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;

  db.pendingUser.find({'user': uid })
    .exec(function(err, invites) {
      // Reshape this into an invite (an object
      // with only a team name and pendingUser 
      // id) using async waterfall  
      res.json({ invites: invites }); 
    });

};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , team = req.body.team;

};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , team = req.body.team;


};