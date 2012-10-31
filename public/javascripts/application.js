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
      activeLength: function() {
        return this.filterProperty('active').length
      }.property('length'),
      inactiveLength: function() {
        return this.filterProperty('active', false).length
      }.property('length')
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
	  			$("#content")
            .animate({
				      left: ["-=275", 'swing']
				    },{ 
              duration: 200, queue: false });
              clone.css({'z-index':'-5'}).animate({
				      left: ["-=275", 'swing']
				    },{
              duration: 200,
              queue: false,
              complete: function() {
                clone.remove();
				      }
            });
        }
    	}
  	}),
  	ChatController:  Em.Controller.extend({
      // post a message
      postMessage: function() {
        var messages = this.content.get("messages");
        var newMessage = App.store.createRecord(App.Message, {
           msg: this.message
        })
        messages.pushObject(newMessage);
        App.store.commit();
      },
      activeChat: function(request) { 
        var that = this;

        // Update the chat's active status
        this.content.set('active', request);
        
        // Let observes know that content has changed
        App.get("router").get("chatpaneController").enumerableContentDidChange()

        // Tell the serve to subscribe/unsubscribe to/from this chat
        if (request) {
          socket.emit('subscribe', {id: this.content.id}, function(channel) {
            socket.on(channel, function(json) {
              var obj = JSON.parse(json);

              ////// * Some testing
              // var newMessage = App.store.createRecord(App.Message, {id: json._id});
              // newMessage.adapterDidCommit();
              // App.store.load(App.Message, json);
              //App.store.load(App.Message, obj);
              //var newMessage = App.Message.find(obj._id);

              App.store.load(App.Message, obj);
              var newMessage = App.Message.find(obj._id);
              newMessage.dataDidChange();

              //var messages = that.content.get("messages");
              //messages.pushObject(newMessage);
            })
          });
        } else {
          socket.emit('unsubscribe', {id: this.content.id});
        }
      }
  	}),
  	ChatView:  Em.View.extend({
  		templateName:  'chat',
      joinchat: function() { 
        this.get("controller").activeChat(true);
      },
      leavechat: function() { 
        this.get("controller").activeChat(false);        
      },
  	}),
    MessagesView:  Em.View.extend({
      didInsertElement:  function() {
        var height = $("#message_window")[0].scrollHeight;
        $('#message_window').scrollTop(height);

        var msg = this.$('.text .msg span');
        var raw = msg.text();
        if (raw.indexOf("<code>") != -1) {
          var sanitized = raw.replace(/<code>/, ''); // Fix this regexp  
          this.$('.text .msg').html('<pre class="code cm-s-default"></pre>');
          CodeMirror.runMode(sanitized, {name: "javascript", json: true}, this.$('.text .msg pre').get(0));
        }
      }
    }),
    SingleChatView:  Em.View.extend({
      classNames: ["chat", "ellipsis"],
      didInsertElement:  function() {
      }
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
    MessageTextareaView: Em.TextArea.extend({
      // Should binding be delayed and only update when user clicks enter?
      // Doing it this way should allow the state of value to be kept when switching between chats
      keyDown: function(e) {
        if (e.which == 13) {
          e.preventDefault();
          App.router.get("chatController").postMessage();
          $("#response").val('');
        }
      }
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
                var allChats = App.store.findAll(App.Chat);
                router.get('applicationController').connectOutlet('navpane', 'chatpane', allChats);
              
                // Check if a state property is set and transition to appropriate chat (i.e. transitionTo "chat" with a certain context)
              }
	        	}),
        		chat: Ember.Route.extend({
        			route: '/:id',
        			connectOutlets: function(router, chat) {
                // What is the proper way to do this? Using a run loop?
                Ember.run.later(function() {
                  // Fetch the unloaded messages
                  //chat.get("messages").fetch();
                  router.get('applicationController').connectOutlet('content', 'chat', chat);
                }, 150);
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
              //router.get('applicationController').connectOutlet('content', 'chat');
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

socket.on('connect', function () {
  socket.on('')
});


// Sockets serializer

(function() {
var get = Ember.get;

DS.SOCKETserializer = DS.Serializer.extend({
  keyForBelongsTo: function(type, name) {
    return this.keyForAttributeName(type, name) + "_id";
  },

  keyForAttributeName: function(type, name) {
    return Ember.String.decamelize(name);
  },

  addBelongsTo: function(hash, record, key, relationship) {
    var hashKey = this._keyForBelongsTo(record.constructor, key),
        id = get(record, key+'.id');

    if (!Ember.none(id)) { hash[hashKey] = id; }
  },

  // addHasMany: function(hash, record, key, relationship) {
  //   console.log("testttt");
  //   var hashKey = this._keyForHasMany(record.constructor, key),
  //       id = get(record, key+'.id');

  //   if (!Ember.none(id)) { hash[hashKey] = id; }
  // }
});

})();



App.SOCKETadapter = DS.Adapter.extend({

  serializer: DS.SOCKETserializer.create(),

	find:  function(store, type, id) {
		var that = this;
    var root = this.convertToRoot(type);

    socket.emit('find', root, id, function(response) {
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

	findQuery:  function(store, type, query, modelArray) {
		// Implement this function
	},

	createRecord:  function(store, type, record) {
		var that = this;
    var data = this.toJSON(record, {associations: true});
    var root = this.convertToRoot(type);
    console.log(data);


		socket.emit('createRecord', root, data, function(response) {
			if (response.success) {
				that.didCreateRecord(store, type, record, response.json);
			}
		})
	},

	didCreateRecord: function(store, type, record, json) {
		var root = this.convertToRoot(type);

    debugger;
    	//this.sideload(store, type, data, root);

      // Updates in-flight status of the parent object 
      record.eachAssociation(function(name, meta) {
          if (meta.kind === 'belongsTo') {
            store.didUpdateRelationship(record, name);
          }
        });

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

	updateRecord:  function(store, type, record) {
		var that = this;
    var data = this.toJSON(record, {associations: true});
		var root = this.convertToRoot(type);

		socket.emit('updateRecord', root, data, function(response) {
			// On success...
			if (response.success) {
				that.didUpdateRecord(store, type, record, response.data)
			}
		})
	},

  didUpdateRecord: function(store, type, record, json) {
    var root = this.convertToRoot(type);

    //this.sideload(store, type, json, root);
    store.didSaveRecord(record, json && json[root]);
  },

  convertToRoot:  function(type) {
    var root =  type.toString().replace('App.', '').toLowerCase().capitalize();
    return root;
  }


});


// Mapping

App.SOCKETadapter.map("App.Chat", { primaryKey: "_id" });
App.SOCKETadapter.map("App.Message", { primaryKey: "_id" });


// Store

App.store = DS.Store.create({
	revision: 7,
	adapter: App.SOCKETadapter.create({
		mappings: {
     		 // all your models will have to have a mapping defined like this
      		chat: 'App.Chat',
          message: 'App.Message'
    	}
	})
});


// Models

App.Message = DS.Model.extend({
	user: DS.attr('string'),
	msg: DS.attr('string'),
	time: DS.attr('string'),
	chat: DS.belongsTo('App.Chat'),

  human_time: function() {
    var date = moment(this.get("time"));
    return date.format("h:mm a");
  }.property('time'),

  name: function() {
    //return this.get("chat").get("participants").get("firstObject").name;
    return "Max Gillett";
  }.property('chat')
});

App.Chat = DS.Model.extend({
  active: false,
  name: DS.attr('string'),
  created_at: DS.attr('string'),
  avatar: DS.attr('string'),
  participants: DS.attr('string'),
	messages: DS.hasMany('App.Message'),

  time: function() {
    try {
      return this.get('messages').get('lastObject').get("human_time")
    } catch(e) {

    }
  }.property('messages.lastObject.human_time'),

	preview: function() {
		try {
			return this.get('messages').get("lastObject").get("msg") 
		} catch(e) {
			return "No messages yet"
		}
	}.property('messages.lastObject.msg')
});


App.initialize();

// var message = App.store.load(App.Message, { msg: 'ffffinally?',
//   chat_id: "508f3a481b82b41c8b00001b",
//   user: "508730e72276050000000002",
//   _id: "509099b921d54eeebds00000111111",
//   time: "Tue Oct 30 2012 22:23:37 GMT-0500 (CDT)" });

//console.log(message);