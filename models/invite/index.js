var mongoose = require('mongoose')
  , db = require('../../config/db')
  , _ = require('underscore')
  , async = require('async');

var schema = exports.schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  accepted: Boolean
});

schema.virtual('name').get(function () {
  return this.team.name;
});