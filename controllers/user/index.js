var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');


exports.show = function(req, res, next){
  var id = req.param("id");

  db.user.findById(id, '-members_users -pending_users')
    .exec(function(err, user) {
      res.json({ user: user });
    });
};

// Can this be split up into an index and query route?
exports.index = function(req, res, next){
  var obj = req.query
    , key = _.keys(obj)[0];

  switch (key) {
    case 'email':
      // Find or create
      db.user.findOne({email: obj.email}, '-name -members_users -pending_users')
        .exec(function(err, user) {
          if (!user) {
            db.user.create({email: obj.email}, function(err, newuser) {
              res.json({ users: [newuser] });
            });
          } else {
            res.json({ users: [user] });
          }
        });
      break;
    case 'ids':
      db.user.find({'_id': { $in: obj.ids } })
        .exec(function(err, users) {
          res.json({ users: users });
        });
      break;
    default: 
      db.user.find({})
        .exec(function(err, users) {
          res.json({ users: users });
        });
  }
};

exports.update = function(req, res, next){
  var uid = req.session.passport.user 
    , user_data = req.body.user 
    , user_id = req.param("id") 
    , team_id = user_data.teams_id;  

  if (team_id) {
    async.waterfall([
      function(callback) {
        db.pendingUser.create({ user: user_id, team: team_id }, function(err, pendingUser) {
          callback(null, pendingUser)
        });
      },      
      function(pendingUser, callback){
        db.user.findById(user_id)
          .exec(function(err, user) {
            user.pending_users.push(pendingUser._id);
            user.pending.push(team_id);
            user.save(function(err, user) {
              callback(null, pendingUser, user)
            });
          });
      },
      function(pendingUser, user, callback){
        db.team.findById(team_id)
          .where('members').in([uid])
          .exec(function(err, team) {
            team.pending_users.push(pendingUser._id);
            team.pending.push(user_id);
            team.save(function(err, team) {
              callback(null, user)
            });
          });
      }
    ],
    function(err, user){
        res.json({ user: user });
    });
  }
}
