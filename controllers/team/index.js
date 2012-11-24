var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

  db.team.findById(id)
    .exec(function(err, team) {
      res.json({ team: team });
    });
};

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;

  db.team.findAllTeams(uid, 
    function(err, teams) {
      res.json({teams: teams});
    }
  );
};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , data = req.body.team;

  db.team.createTeam(data, uid, function(err, team) {
    res.json({ team: team });
  });
};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , team = req.body.team;

  db.team.findByIdAndUpdate(id, team)
    .exec(function(err, data) {
      res.json({ team: data });
    });
}