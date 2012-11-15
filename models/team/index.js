var mongoose = require('mongoose');

var schema = exports.schema = new mongoose.Schema({
  name: String,
  slots: Number,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pending: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});