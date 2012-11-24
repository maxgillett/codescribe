var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

  db.team.findById(id, '-pending -members')
    .where('members').in([uid])
    .populate('members_users')
    .populate('pending_users')
    .exec(function(err, team) {
        res.json({ team: team });
      });
};

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;

  db.team.findAllTeams(uid, 
    function(err, results) {
      var obj = _.object(['teams', 'memberUsers', 'pendingUsers'], results);
      res.json(obj);
    }
  );
};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , data = req.body.team;

  db.team.createTeam(data, uid, function(err, team, memberUser) {
    team = _.omit(team.toObject(), 'pending', 'members');
    memberUser = memberUser.toObject();;
    team.members_users = [memberUser];
    res.json({ team: team });
  });
};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , team = req.body.team;

  db.team.findByIdAndUpdate(id, team, {select: '-members -pending'})
    .populate('members_users')
    .populate('pending_users')
    .exec(function(err, data) {
      res.json({ team: data });
    });
}