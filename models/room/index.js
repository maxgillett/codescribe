var mongoose = require('mongoose');

var schema = exports.schema = new mongoose.Schema({
  created_at: { type: Date, default: Date.now },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});