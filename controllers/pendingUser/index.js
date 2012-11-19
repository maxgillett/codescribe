var db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');


exports.show = function(req, res, next){
  var id = req.param("id");

  db.pendingUser.findById(id)
    .exec(function(err, pendingUser) {
      res.json({ pendingUser: pendingUser });
    });
};

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

