var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

};

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;

  db.invite.find({'user': uid })
    .populate('team')
    .exec(function(err, invites) {
      var names, ids, invites;
      
      // Object manipulation to retrieve just ids + names
      names = _.pluck(invites, 'team');
      names = _.pluck(names, 'name');
      ids = _.pluck(invites, '_id');
      accepted = _.pluck(invites, 'accepted');
      invites = _.zip(names, ids, accepted);

      invites = _.map(invites, function(arr) {
        return _.object(['name', '_id', 'accepted'], arr);
      });

      res.json({ invites: invites }); 
    });

};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user;

};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , invite = req.body.invite;

  if (invite.accepted) {
    db.team.addMember(id, invite, uid, function(err, team) {
      res.json({ team: team }); 
    });
  }
};

exports.delete = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

  db.team.removePendingMember(id, uid, function(err, pendingUser) {
    res.json({invite: null});
  });
}
