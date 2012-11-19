var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

exports.name = "member_user";

exports.show = function(req, res, next){
  var id = req.param("id");

  db.memberUser.findById(id)
    .exec(function(err, memberUser) {
      res.json({ memberUser: memberUser });
    });
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

