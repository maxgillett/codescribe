var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

// Invites are a layer that sit on top of pendingUsers. 
// An invite ID is a pendingUser ID

exports.show = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id");

}

exports.index = function(req, res, next) {
  var uid = req.session.passport.user;


  async.waterfall([
    function(callback){
        callback(null, 'one', 'two');
    },
    function(arg1, arg2, callback){
        callback(null, 'three');
    },
    function(arg1, callback){
        // arg1 now equals 'three'
        callback(null, 'done');
    }
  ], function (err, result) {
     // result now equals 'done'    
  });

  db.pendingUser.find({'user': uid })
    .populate('team', 'name')
    .exec(function(err, pendingUsers) {
      var names, ids, invites;
      
      names = _.pluck(pendingUsers, 'team');
      names = _.pluck(names, 'name');
      ids = _.pluck(pendingUsers, '_id');

      invites = _.zip(names, ids);

      invites = _.map(invites, function(arr) {
        return _.object(['name', '_id'], arr);
      });

      res.json({ invites: invites }); 
    });

};

exports.create = function(req, res, next) {
  var uid = req.session.passport.user
    , team = req.body.team;

};

exports.update = function(req, res, next) {
  var uid = req.session.passport.user
    , id = req.param("id")
    , team = req.body.team;


};