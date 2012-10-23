// State flag helper function. See https://github.com/ghempton/ember-router-example/blob/master/js/app.js

function stateFlag(name) {
  return Ember.computed(function() {
    var state = App.router.currentState;
    while(state) {
      if(state.name === name) return true;
      state = state.get('parentState');
    }
    return false;
  }).property('App.router.currentState');
}

// Application

App = Em.Application.create({

	ApplicationController: Ember.Controller.extend({
		isDashboard: stateFlag('dashboard'),
		isChats: stateFlag('chats'),
		isFiles: stateFlag('files'),
		animate: true
  	}),
  	ApplicationView: Ember.View.extend({
    	templateName: 'application'
  	}),
  	ChatpaneController:  Em.ArrayController.extend({
  		hideView: false
   	}),
  	ChatpaneView:  Em.View.extend({
  		templateName:  'chatpane',
  		didInsertElement: function(){
  			var doAnimation = App.router.get("applicationController").get("animate")
  			  , that = this

  			if (doAnimation) {
	  			$("#content").css({'left':'202'}).animate({
				    left: ["+=275", 'swing'],
				},{ duration: 200, queue: false });
	        	this.$("#nav_pane").css({'left':'-=275', 'z-index':'-5'}).animate({
				    left: ["+=275", 'swing']
				},{ duration: 200, queue: false, complete: function() {
					that.$("#nav_pane").css('z-index',5);
				}});
			} else {
				$("#content").css({'left':'477'});
			}
    	},
    	willDestroyElement: function() {
  			var doAnimation = App.router.get("applicationController").get("animate")
  			  , that = this

  			if (doAnimation) {
	    		var that = this;
	    		var clone = this.$("#nav_pane").clone();
	    		this.$().replaceWith(clone);
	  			$("#content").animate({
				    left: ["-=275", 'swing'],
				},{ duration: 200, queue: false });
	        	clone.css({'z-index':'-5'}).animate({
				    left: ["-=275", 'swing']
				},{ duration: 200, queue: false, complete: function() {
					clone.remove();
				}});
        	}
    	}
  	}),
  	ChatroomController:  Em.Controller.extend({

  	}),
  	ChatroomView:  Em.View.extend({
  		templateName:  'chatroom'
  	}),
  	ChatController:  Em.Controller.extend({

  	}),
  	ChatView:  Em.View.extend({
  		templateName:  'chat'
  	}),
  	DashboardController:  Em.Controller.extend({
  	}),
  	DashboardView:  Em.View.extend({
  		templateName:  'dashboard'
  	}),
  	FileListController:  Em.Controller.extend({

  	}),
  	FileListView:  Em.View.extend({
  		templateName:  'filelist',
  		didInsertElement: function(){
  			var doAnimation = App.router.get("applicationController").get("animate")
  			  , that = this

	  		if (doAnimation) {
	  			$("#content").css({'left':'202'}).animate({
				    left: ["+=275", 'swing'],
				},{ duration: 200, queue: false });
	        	this.$("#nav_pane").css({'left':'-=275', 'z-index':'-5'}).animate({
				    left: ["+=275", 'swing']
				},{ duration: 200, queue: false, complete: function() {
					that.$("#nav_pane").css('z-index',5);
				}});
			} else {
				$("#content").css({'left':'477'});
			}
    	},
    	willDestroyElement: function() {
  			var doAnimation = App.router.get("applicationController").get("animate")
  			  , that = this

	  		if (doAnimation) {
	    		var clone = this.$("#nav_pane").clone();
	    		this.$().replaceWith(clone);
	  			$("#content").animate({
				    left: ["-=275", 'swing'],
				},{ duration: 200, queue: false });
	        	clone.css({'z-index':'-5'}).animate({
				    left: ["-=275", 'swing']
				},{ duration: 200, queue: false, complete: function() {
					clone.remove();
				}});
    		}
    	}
  	}),
  	FileInspectorController:  Em.Controller.extend({

  	}),
  	FileInspectorView:  Em.View.extend({
  		templateName:  'fileinspector'
  	}),
  	Router: Ember.Router.extend({
  		//location: 'history',
  		enableLogging: true,
  		targetState: "",
  		goToDashboard:  function() {
  			this.set("targetState", "index"); // Is there a better way to do this?
  			App.router.transitionTo('root.dashboard');
  		},
  		goToChats:  function() {
  			this.set("targetState", "chats");
  			App.router.transitionTo('root.chats.index')
  		},
  		goToFiles:  function() {
  			this.set("targetState", "files");
			App.router.transitionTo('root.files')
		},
		createNewRoom:  function() {
			this.set("targetState", "chats");
			App.store.createRecord(App.Chat,  { name: "Maxwell Gillett" });
			App.store.commit();
			App.router.transitionTo('root.chats.create');
		},
	    root:  Ember.Route.extend({
	    	dashboard:  Ember.Route.extend({
        		route:  '/',
        		connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('content', 'dashboard');
        		}
        	}),
        	chats:  Em.Route.extend({
        		showChat:  Em.Route.transitionTo('chats.chat'),
        		route:  '/chats',
        		index: Ember.Route.extend({
        			route: '/',
	        	}),
        		chat: Ember.Route.extend({
        			route: '/:id',
        			connectOutlets: function(router, chat) {
        				router.get('chatroomController').connectOutlet('messages', 'chat', App.store.find(App.Chat, chat.id));
        			}
        		}),
        		create:  Ember.Route.extend({
        			route: '/new'
        		}),
        		exit: function(router) {
        			// If target state is index, then animate destruction of element
        			var animate = (App.router.targetState == "index") ? true : false;
        			router.get("applicationController").set("animate", animate);
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
        			// If current state is index, then animate element
		        	var currentState = router.get('currentState.name');
		        	console.log(currentState);
        			var animate = (currentState == "dashboard") ? true : false;
		        	router.get("applicationController").set("animate", animate);
		        },
		        connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('navpane', 'chatpane', App.store.findAll(App.Chat));
        			router.get('applicationController').connectOutlet('content', 'chatroom');
        		},
        	}),
        	files:  Em.Route.extend({
        		route:  '/files',
        		exit: function(router) {
        			// If target state is index, then animate destruction of element
        			var animate = (App.router.targetState == "index") ? true : false;
        			router.get("applicationController").set("animate", animate);
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
        			// If current state is index, then animate element
		        	var currentState = router.get('currentState.name');
        			var animate = (currentState == "dashboard") ? true : false;
		        	router.get("applicationController").set("animate", animate);
		        },
		        connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('navpane', 'fileList');
        			router.get('applicationController').connectOutlet('content', 'fileInspector');
        		}
        	})
	    })
	})
});

// Configure sockets

var socket = io.connect('http://localhost:3000');

// Sockets adapter

App.adapter = DS.Adapter.create({
	find:  function(store, type, id) {
		var url = type.url;
		url = url.fmt(id);

		socket.emit('find', url, function(data){
			store.load(type, id, data);
		})
	},
	findAll: function(store, type, id) {
		console.log(type.url)
		var url = type.url;
		url = url.fmt(id);

		socket.emit('find', url, function(data){
			store.load(type, id, data);
		})
	},
	findMany:  function(store, type, ids) {
		var url = type.url;
		url = url.fmt(ids.join(','));

		socket.emit('findMany', url, function(data) {
			store.loadMany(type, ids, data);
		})
	},
	findQuery:  function(store, type, query, modelArray) {
		// Implement this function
	},
	createRecord:  function(store, type, model) {
		console.log("TRYING TO CREATE RECORD");
		var url = type.url
		url = url.fmt(model.get('id)'));
		var data = model.get('data');

		socket.emit('createRecord', 'url', 'data', function(response) {
			// On success...

			if (response.success) {
				store.didCreateRecord(model, response.data)
			}
		})
	},
	updateRecord:  function(store, type, model) {
		var url = type.url;

		socket.emit('updateRecord', url, data, function(response) {
			// On success...
			if (response.success) {
				store.didUpdateRecord(model, response.data)
			}
		})
	}
});

// Store

App.store = DS.Store.create({
	revision: 6,
	adapter: App.adapter
});

// Models

App.Message = DS.Model.extend({
	name: DS.attr('string'),
	msg: DS.attr('string'),
	time: DS.attr('string'),
	chat: DS.belongsTo('App.Chat')
});

App.Message.reopenClass({
    url: '/message/%@'
});

App.Chat = DS.Model.extend({
	url: '/people/%@',
    name: DS.attr('string'),
    avatar: DS.attr('string'),
	messages: DS.hasMany('App.Message', {embedded: true,}),
	preview: function() {
		try {
			return this.get('messages').get("firstObject").get("msg") 
		} catch(e) {
			return "Send a message"
		}
	}.property('messages')
});

App.Chat.reopenClass({
    url: '/chat/%@'
});


// Bootstrapping some data for testing purposes
App.store.loadMany(App.Chat, [{ id: 1,
								name: 'John Doe',
								avatar: 'test2',
								messages: [
									{
									id: 1,
									name: 'John Doe',
									msg: 'This is a test post one two three. This is a te two three. This is a test post one two three. This is a test post one two three',
									time: '1:10pm'
									},{
									id: 2,
									name: 'John Doe',
									msg: ' This is another test post sicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis no three two one',
									time: '1:15pm'
									},{
									id: 4,
									name: 'John Doe',
									msg: 'This is a test post one two three. This is a te two three. This is a test post one two three. This is a test post one two three',
									time: '1:10pm'
									},{
									id: 5,
									name: 'John Doe',
									msg: ' This is another test post sicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis no three two one',
									time: '1:35pm'
									}
								]
							 },
							 {  id: 2,
								name: 'Jane Doe',
								avatar: 'test',
								messages: [
									{
									id: 6,
									name: 'Jane Doe',
									msg: 'This is a test post one two three. This is a test post one two three. This is a test post one two three. This is a test post one two three. This is a test post one two three',
									time: '1:10pm'
									},{
									id: 7,
									name: 'Jane Doe',
									msg: ' This is another test post three two one',
									time: '1:15pm'
									}
								]
							 }]);






// var b = App.store.find(App.Chat, 1);
// console.log(b.get("name")) // Foo Bar
// console.log(b.get("messages").get("content")) // []  (an empty array)


// Views

// Controllers

App.initialize();