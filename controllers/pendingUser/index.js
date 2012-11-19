var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.name = "pending_user";

exports.show = function(req, res, next){
  var id = req.param("id");

  db.pendingUser.findById(id)
    .exec(function(err, pendingUser) {
      res.json({ pendingUser: pendingUser });
    });
};

exports.create = function(req, res, next){
  var uid = req.session.passport.user
    , data = req.body.pending_user;

  async.waterfall([
      function(callback){
        db.pendingUser.create(data, function(err, pendingUser) {
          callback(null, pendingUser);
        });
      },
      function(pendingUser, callback){
        db.team.findById(data.team)
          .where('members').in([uid])
          .exec(function(err, team) {
            team.pending.push(data.user);
            team.pending_users.push(pendingUser._id);
            team.save(function(err, team) {
              callback(null, pendingUser, team)
            });
          });
      },
      function(pendingUser, team, callback) {
        db.user.findById(data.user)
          .exec(function(err, user) {
            user.pending.push(team._id);
            user.pending_users.push(pendingUser._id);
            user.save(function(err, user) {
              callback(null, pendingUser, team, user);
            });
          });
      }
  ], function (err, pendingUser, team, user) {
      // pendingUser = pendingUser.toObject();
      // pendingUser.team_id = pendingUser.team;
      // pendingUser.user_id = pendingUser.user;
      console.log(pendingUser);
      res.json({ pendingUser: pendingUser });  
  });

}

// Can this be split up into an index and query route?
exports.index = function(req, res, next){
  var obj = req.query
    , key = _.keys(obj)[0];

  switch (key) {
    case 'ids':
      db.pendingUser.find({'_id': { $in: obj.ids } })
        .exec(function(err, pendingUsers) {
          res.json({ pendingUsers: pendingUsers });
        });
      break;
    default: 
      db.pendingUser.find({})
        .exec(function(err, pendingUsers) {
          res.json({ pendingUsers: pendingUsers });
        });
  }
};

