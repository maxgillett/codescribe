var mongoose = require('mongoose');

var schema = exports.schema = new mongoose.Schema({
  uid: String,
  name: String,
  username: String,
  avatar: String,
  email: { type: String, unique: true }
});

schema.statics.findOrCreate = function(data, done) {
  var that = this;
  var user = this.findOne({uid: data.uid}, 'name', function(err, user) {
    if (!user) {
      that.create(data, function(err, newuser) {
        return done(null, newuser);
      });
    } 
    done(null, user);
  });
}

