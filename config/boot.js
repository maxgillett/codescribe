var app = require('../app').app
  , fs = require('fs');

module.exports = function(options){
  var verbose = options.verbose;

  // Import controllers
  fs.readdirSync(__dirname + '/../controllers').forEach(function(name){
    verbose && console.log('\n   %s:', name);
    var obj = require('../controllers/' + name)
      , name = obj.name || name
      , prefix = '/api/v1'
      , method
      , path;

    // before middleware support
    if (obj.before) {
      path = '/' + name + '/:' + name + '_id';
      app.all(path, obj.before);
      verbose && console.log('     ALL %s -> before', path);
      path = '/' + name + '/:' + name + '_id/*';
      app.all(path, obj.before);
      verbose && console.log('     ALL %s -> before', path);
    }

    // generate api routes based on the exported methods
    for (var key in obj) {
      // "reserved" exports
      if (~['name', 'prefix', 'engine', 'before'].indexOf(key)) continue;
      // route exports
      switch (key) {
        case 'delete':
          method = 'delete';
          path = '/' + name + 's/:id';
          break;
        case 'show':
          method = 'get';
          path = '/' + name + 's/:id';
          break;
        case 'list':
          method = 'get';
          path = '/' + name + 's';
          break;
        case 'edit':
          method = 'get';
          path = '/' + name + '/:id/edit';
          break;
        case 'update':
          method = 'put';
          path = '/' + name + 's/:id';
          break;
        case 'create':
          method = 'post';
          path = '/' + name + 's';
          break;
        case 'index':
          method = 'get';
          path = '/' + name + 's';
          break;
        default:
          throw new Error('unrecognized route: ' + name + '.' + key);
      }

      path = prefix + path;
      app[method](path, ensureAuthenticated, obj[key]);
      verbose && console.log('     %s %s -> %s', method.toUpperCase(), path, key);
    }

  });
};

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}