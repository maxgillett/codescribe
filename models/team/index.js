var mongoose = require('mongoose')
  , db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

var schema = exports.schema = new mongoose.Schema({
  name: String,
  slots: Number,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  members_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MemberUser' }],
  pending_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PendingUser' }]
});

/*

The following class methods are available:

 - findAllTeams:        Finds all teams belonging to the current user
 - createTeam:          Creates a new team
 - addMember:           Reclassifies a user as a team member
 - addPendingMember:    Classifies a user as a pending team member
 - removeMember:        Removes a member from the team
 - removePendingMember: Removes a pending member and DOES NOT reclassify
                        them as a member

 Join models (memberUser + pendingUser) and team-related fields
 on a user model instance can only be affected by performing an 
 action on a team

 */


schema.statics.findAllTeams = function(uid, cb) {
  async.parallel([
    function(callback){
      db.team.find({}, '-pending -members')
        .where('members').in([uid])
        .populate('members_users')
        .populate('pending_users')
        .exec(function(err, teams) {
          callback(null, teams);
        });
    }
  ], cb);
}

schema.statics.createTeam = function(data, uid, cb) {
  async.waterfall([
    function(callback){
      db.team.create(data, function(err, team) {
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
     cb(err, team, memberUser); 
  });  
}

schema.statics.removeTeam = function(id, uid, cb) {
  async.waterfall([
    function(callback){
      db.team.create(data, function(err, team) {
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
     cb(err, team, memberUser); 
  });  
}

schema.statics.addMember = function(id, uid, cb) {
  async.waterfall([
    function(callback){
      db.pendingUser.findByIdAndRemove(id)
        .populate('team')
        .populate('user')
        .exec(function(err, pendingUser) {
          var team = pendingUser.team
            , user = pendingUser.user;
          callback(null, team, user);
        });
    },
    function(team, user, callback){
      db.memberUser.create({ user: uid, team: team._id }, function(err, memberUser) {
        callback(null, team, user, memberUser)
      });
    },    
    function(team, user, memberUser, callback) {
      team.pending.remove(uid);
      team.pending_users.remove(id);
      team.members.push(uid);
      team.members_users.push(memberUser._id);
      team.save(function(err, team) {
        callback(null, team, user, memberUser)
      });
    }, 
    function(team, user, memberUser, callback) {
      user.teams.push(team._id);
      user.members_users.push(memberUser._id);
      user.save(function(err, user) {
        callback(null, team, user, memberUser);
      });
    }
  ], function (err, team, memberUser) {
      cb(err, team, memberUser);
  });  
};

schema.statics.addPendingMember = function(data, uid, cb) {
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
  ],  function (err, pendingUser, team, user) {
        cb(err, pendingUser); 
  });
}

schema.statics.removeMember = function() {
  // Build out this method
};

schema.statics.removePendingMember = function(id, uid, cb) {
  db.pendingUser.findByIdAndRemove(id)
    .exec( cb(err,pendingUser) );
};

