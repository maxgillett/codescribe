var mongoose = require('mongoose');

var schema = exports.schema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});