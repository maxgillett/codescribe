String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

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
  		goToChat:  function(chat) {
  			this.set("targetState", "chats");
  			App.router.transitionTo('root.chats.chat', chat)
  		},
  		goToFiles:  function() {
  			this.set("targetState", "files");
        App.router.transitionTo('root.files')
  		},
  		createNewRoom:  function() {
  			this.set("targetState", "chats");
  			
  			var toChats = function() {
  				App.router.transitionTo('root.chats.chat', chat);
  			};

  			var chat = App.store.createRecord(App.Chat,  { name: "Maxwell Gillett", participants: ["508730e72276050000000002"] });
  			chat.addObserver('id', this, toChats);
  			App.store.commit();
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
              connectOutlets: function(router, context) {
                router.get('applicationController').connectOutlet('navpane', 'chatpane', App.store.findAll(App.Chat));
                router.get('applicationController').connectOutlet('content', 'chatroom');
              }
	        	}),
        		chat: Ember.Route.extend({
        			route: '/:id',
        			connectOutlets: function(router, chat) {
                // This is still kind of buggy. Getting a mapping error in the console. Appears to work however
                Ember.run.schedule('render', this, function(){
                  router.get('chatroomController').connectOutlet('messages', 'chat', chat);
                });
        			},
              deserialize: function(router, params) {
                return App.store.find(App.Chat, params.id);
              }
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
            connectOutlets:  function(router, context) {
              router.get('applicationController').connectOutlet('navpane', 'chatpane', App.store.findAll(App.Chat));
              router.get('applicationController').connectOutlet('content', 'chatroom');
            }
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

App.SOCKETadapter = DS.Adapter.extend({

	find:  function(store, type, id) {
		var that = this;
    var root = this.convertToRoot(type);

    socket.emit('find', root, id, function(response) {
      console.log(response);
      if (response.success) {
        that.didFindRecord(store, type, response.json)
      }
    })
	},

  didFindRecord: function(store, type, json) {
    var root = this.convertToRoot(type);

    //this.sideload(store, type, json, root);
    store.load(type, json[root]);
  },

	findAll: function(store, type) {
		var that = this;
    var root = this.convertToRoot(type);

		socket.emit('findAll', root, function(response) {
			console.log(response);
			if (response.success) {
				that.didFindAll(store, type, response.json)
			}
		})
	},

	didFindAll: function(store, type, json) {
		var root = this.convertToRoot(type);

	  //this.sideload(store, type, json, root);
	  store.loadMany(type, json[root]);

	  store.didUpdateAll(type);
	},

	findMany:  function(store, type, ids) {
		// Implement this function
	},

	findQuery:  function(store, type, query, modelArray) {
		// Implement this function
	},

	createRecord:  function(store, type, record) {
		var that = this;
    var data = this.toJSON(record);
    var root = this.convertToRoot(type);

		socket.emit('createRecord', root, data, function(response) {
			if (response.success) {
				that.didCreateRecord(store, type, record, response.json);
			}
		})
	},

	didCreateRecord: function(store, type, record, json) {
		var root = this.convertToRoot(type);

    	//this.sideload(store, type, data, root);
    	store.didSaveRecord(record, json[root]);
  	},

  sideload: function(store, type, json, root) {
    var sideloadedType, mappings, loaded = {};

    loaded[root] = true;

    for (var prop in json) {
		if (!json.hasOwnProperty(prop)) { continue; }
		if (prop === root) { continue; }
		if (prop === get(this, 'meta')) { continue; }

		sideloadedType = type.typeForAssociation(prop);

		if (!sideloadedType) {
			mappings = get(this, 'mappings');
			Ember.assert("Your server returned a hash with the key " + prop + " but you have no mappings", !!mappings);

			sideloadedType = get(mappings, prop);

			if (typeof sideloadedType === 'string') {
			  sideloadedType = get(window, sideloadedType);
			}

        	Ember.assert("Your server returned a hash with the key " + prop + " but you have no mapping for it", !!sideloadedType);
    	}

    	this.sideloadAssociations(store, sideloadedType, json, prop, loaded);
    }
	},

	sideloadAssociations: function(store, type, json, prop, loaded) {
		loaded[prop] = true;

		get(type, 'associationsByName').forEach(function(key, meta) {
	  		key = meta.key || key;
	  		if (meta.kind === 'belongsTo') {
	    		key = this.pluralize(key);
	  		}
	  		if (json[key] && !loaded[key]) {
	    		this.sideloadAssociations(store, meta.type, json, key, loaded);
	  		}
		}, this);

		this.loadValue(store, type, json[prop]);
	},

	loadValue: function(store, type, value) {
		if (value instanceof Array) {
			store.loadMany(type, value);
		} else {
			store.load(type, value);
		}
	},

	updateRecord:  function(store, type, model) {
		var that = this;
		var url = type.url;

		socket.emit('updateRecord', url, data, function(response) {
			// On success...
			if (response.success) {
				that.didUpdateRecord(model, response.data)
			}
		})
	},

  convertToRoot:  function(type) {
    var root =  type.toString().replace('App.', '').toLowerCase().capitalize();
    console.log(root);
    return root;
  }


});


// Mapping

App.SOCKETadapter.map("App.Chat", { primaryKey: "_id" });


// Store

App.store = DS.Store.create({
	revision: 6,
	adapter: App.SOCKETadapter.create({
		mappings: {
     		 // all your models will have to have a mapping defined like this
      		chat: 'App.Chat'
    	}
	})
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
	primaryKey: '_id',
    name: DS.attr('string'),
    created_at: DS.attr('string'),
    avatar: DS.attr('string'),
    participants: DS.attr('string'),
	messages: DS.hasMany('App.Message', {embedded: true,}),
	preview: function() {
		try {
			return this.get('messages').get("firstObject").get("msg") 
		} catch(e) {
			return "No messages yet"
		}
	}.property('messages')
});

// Define the mappings


// Bootstrapping some data for testing purposes

App.store.loadMany(App.Chat, [{ _id: 1,
								participants: [{
									name: 'John Doe'
								}],
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
							 {  _id: 2,
								participants: [{
									name: 'Jane Doe'
								}],
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

App.initialize();


