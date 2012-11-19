var db = require('../../config/db')
  , async = require('async');

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

  // Refactor into async control structure
	db.team.find({}, '-pending -members')
    .where('members').in([uid])
	  .exec(function(err, teams) {
      db.memberUser.find({})
        .exec(function(err, memberUsers) {
          db.pendingUser.find({})
            .exec(function(err, pendingUsers) {
              res.json({ memberUsers: memberUsers, pendingUsers: pendingUsers, teams: teams });
            });
        });
	    //res.json({ teams: teams });
	  });


};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , team = req.body.team;

  async.waterfall([
      function(callback){
        db.team.create(team, function(err, team) {
          callback(null, team);
        });
      },
      function(team, callback) {
        db.memberUser.create({ user: uid, team: team._id }, function(err, memberUser) {
          callback(null, team, memberUser)
        });
      }, 
      function(team, memberUser, callback){
          team.members.push(uid);
          team.members_users.push(memberUser._id);
          team.save(function(err, team) {
            callback(null, team, memberUser)
          });
      }
  ], function (err, team, memberUser) {
     res.json({ team: team, memberUser: memberUser });  
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