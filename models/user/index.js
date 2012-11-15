var mongoose = require('mongoose');

var schema = exports.schema = new mongoose.Schema({
  uid: { type: String, unique: true },
  name: String,
  username: String,
  avatar: String,
  email: String,
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