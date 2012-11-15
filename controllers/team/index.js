var db = require('../../config/db');

exports.show = function(req, res, next){
  var uid = req.session.passport.user
    , id = req.param("id");

  db.team.findById(id)
    .where('members').in([uid])
    .exec(function(err, team) {
        res.json({ team: team });
      });
};

exports.index = function(req, res, next){
  var uid = req.session.passport.user;

	db.team.find({})
    .where('members').in([uid])
	  .exec(function(err, teams) {
	    res.json({ teams: teams });
	  });


};