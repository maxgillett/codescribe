var db = require('../../config/db');

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

  db.team.findById(id)
    .where('members').in([uid])
    .exec(function(err, team) {
        res.json({ team: team });
      });
};

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;

	db.team.find({})
    .where('members').in([uid])
	  .exec(function(err, teams) {
	    res.json({ teams: teams });
	  });
};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , team = req.body.team;

  team.members = [uid];

  db.team.create(team, function(err, team) {
    res.json({ team: team });
  });
};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , team = req.body.team;

  db.team.findByIdAndUpdate(id, team, function(err, data) {
    res.json({ team: data });
  })
}