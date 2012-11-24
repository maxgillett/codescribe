var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.name = "member";

exports.show = function(req, res, next){
  var id = req.param("id");

  db.memberUser.findById(id)
    .exec(function(err, memberUser) {
      res.json({ memberUser: memberUser });
    });
};

exports.create = function(req, res, next){
  var uid = req.session.passport.user
    , data = req.body.member;

  // Why is ember requiring me to pass only a single 
  // member? (says that cannot find mapping for 'members')
  // Can't I send all of the members over?
  db.team.addPendingMember(data, uid, function(err, member) {
    res.json({ member: member });
  })
};

// Can this be split up into an index and query route?
exports.index = function(req, res, next){
  var obj = req.query
    , key = _.keys(obj)[0];

  switch (key) {
    case 'ids':
      db.memberUser.find({'_id': { $in: obj.ids } })
        .exec(function(err, memberUsers) {
          res.json({ memberUser: memberUsers });
        });
      break;
    default: 
      db.memberUser.find({})
        .exec(function(err, memberUsers) {
          res.json({ memberUsers: memberUsers });
        });
  }
};

