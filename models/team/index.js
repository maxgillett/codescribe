var mongoose = require('mongoose')
  , db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

var memberSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  pending: Boolean
});

var schema = exports.schema = new mongoose.Schema({
  name: String,
  slots: Number,
  members: [memberSchema]
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

 */

schema.statics.findAllTeams = function(uid, cb) {
  console.log(uid)
  async.waterfall([
    function(callback){
      db.team.find({})
        .where('members').elemMatch({ user: uid, pending: false})
        .exec(function(err, teams) {
          callback(null, teams);
        });
    }
  ], cb);
}

schema.statics.createTeam = function(data, uid, cb) {
  async.waterfall([
    function(callback) {
      db.team.create(data, function(err, team) {
        team.members.push({
          team: team._id,
          user: uid,
          pending: false
        });
        team.save(function(err, team) {
          callback(null, team);
        })
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

schema.statics.addMember = function(id, data, uid, cb) {
  async.waterfall([
    function(callback){
      db.invite.findByIdAndRemove(id)
        .exec(function(err, invite) {
          callback(null, invite.team);
        });
    },
    function(team, callback){
      db.team.findOne({'_id': team, 'members.user': uid, 'members.pending': true })
        .exec(function(err, team) {
          // Find out how to do this using Mongoose API
          for (var i=0; i < team.members.length; i++){
            if (team.members[i].user == uid){
              team.members[i].pending = false;
            } 
          }
          team.save(function(err, team) {
            callback(null, team);
          });
        }
      );
    }
  ], function (err, team) {
      cb(err, team);
  });  
};

schema.statics.addPendingMember = function(data, uid, cb) {
  async.waterfall([
    function(callback){
      db.team.findById(data.team)
        .exec(function(err, team) {
          var member = {
            team: data.team,
            user: data.user,
            pending: true
          };
          team.members.push(member);
          team.save(function(err, team) {
            callback(null, member)
          });
        });
    },
    function(member, callback){
      db.invite.create({
        team: data.team,
        user: data.user,
        accepted: false
      }, function(err, invite) {
        callback(null, member)
      });
    }
  ], cb);
}

schema.statics.removeMember = function() {
  // Build out this method
};

schema.statics.removePendingMember = function(id, uid, cb) {
  // db.pendingUser.findByIdAndRemove(id)
  //   .exec( cb(err,pendingUser) );
};

