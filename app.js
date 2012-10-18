var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , jade = require('jade');

var app = express();
	app.set('view engine', 'jade');
	app.set('views', "server/views");

app.configure(function() {
  function compile(str, path) {
    return stylus(str)
      .use(nib())
      .import('nib')
      .import(__dirname + '/server/views/reset');
  }
  this.use(stylus.middleware({
    src: __dirname + "/server/views",
    compile: compile,
    force: true
  }));
  this.use(express.static(__dirname+'/server/views'));
});

app.get('/', function(req, res){
	res.render('index');
});

app.listen(3030);
console.log('Listening on port 3030');
