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
			App.router.transitionTo('root.chats.create')
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
        				router.get('chatroomController').connectOutlet('messages', 'chat', chat);
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
		        connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('navpane', 'chatpane', App.Chat.all());
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

// Models

App.Chat = Ember.Object.extend();
App.Chat.reopenClass({
  _listOfChats:  Em.A(),
  all:  function(){
    var allChats = this._listOfChats;
    // Stub an ajax call; like a jQuery.ajax might have done...
    setTimeout( function(){
      allChats.clear();
      allChats.pushObjects([
          { id: '1', name: "Max Gillett", time: "9:15pm", message: 'San Clemente style Lorem ipsum dolor sit amet, consectetur adipisicing  sed do eiusmod tempor incididunt uCruz say this word onceelit, sed do eiusmod tempor incididunt u' },
          { id: '2', name: "John Doe", time: "10:14pm",  message: 'I heard Pénèlope ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt uCruz say this word once.' },
          { id: '3', name: "Jane Doe", time: "1:47am",  message: 'The King would never Lorem ipsum dolor sit amet, consectetur adipisicing sed do eiusmod tempor incididunt uCruz say this word once elit, sed do eiusmod tempor incididunt u lie' },
          { id: '4', name: "Jonathan Doe", time: "1:47am",  message: 'The King would never Lorem ipsum dolor sit amet, consectetur adipisicing sed do eiusmod tempor incididunt uCruz say this word once elit, sed do eiusmod tempor incididunt u lie' }
        ]);
    }, 1);
    return this._listOfChats;
  },
  find:  function(id){
    return this._stubDataSource.findProperty('id', id);
  }
});

// Views

// Controllers

App.initialize();