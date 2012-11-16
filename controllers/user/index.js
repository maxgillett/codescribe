var db = require('../../config/db');

exports.show = function(req, res, next){
  var id = req.param("id");

  db.user.findById(id)
    .exec(function(err, user) {
        res.json({ user: user });
    });
};

exports.query = function(req, res, next){
  var query = req.query;

  res.json({ user: "query executed" });
};

exports.index = function(req, res, next){
  db.user.find({})
    .exec(function(err, users) {
      res.json({ users: users });
    });
};
