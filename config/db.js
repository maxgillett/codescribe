var fs = require('fs')
  , mongo = require('mongodb')
  , mongoose = require('mongoose')
  , db = mongoose.createConnection('localhost', 'test');
  //, troop = require('mongoose-troop');

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Mongo db connection established")
});

// Import models

fs.readdirSync(__dirname + '/../models').forEach(function(name) {
  var obj = require('../models/' + name)
    , name = obj.name || name
    , schema = obj.schema;

  //schema.plugin(troop.timestamp)

  exports[name] = db.model(name.capitalize(), schema);
});


