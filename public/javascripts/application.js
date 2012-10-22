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
		isDashboard: stateFlag('index'),
		isChats: stateFlag('chats'),
		isFiles: stateFlag('files')
  	}),
  	ApplicationView: Ember.View.extend({
    	templateName: 'application'
  	}),
  	ChatlistController:  Em.Controller.extend({
  		hideView: false
   	}),
  	ChatlistView:  Em.View.extend({
  		templateName:  'chatlist',
  		didInsertElement: function(){
  			var doAnimation = this.get("controller").content.animate
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
  			var doAnimation = this.get("controller").content.animate
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
  			var doAnimation = this.get("controller").content.animate
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
  			var doAnimation = this.get("controller").content.animate
  			  , that = this

  			console.log('doAnimation: ',doAnimation);

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
  		goToDashboard:  Ember.Route.transitionTo('root.index'),
  		goToChats:  Ember.Route.transitionTo('root.chats'),
  		goToFiles:  Em.Route.transitionTo('root.files'),
	    root:  Ember.Route.extend({
	    	index:  Ember.Route.extend({
        		route:  '/',
        		connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('content', 'dashboard');
        		}
        	}),
        	chats:  Em.Route.extend({
        		route:  '/chats',
        		exit: function(router) {
        			router.get('chatlistController').set('content', {animate: false});
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
		        	console.log("entering root.chats", router.get('currentState.parentState.name'));
		        	var currentState = router.get('currentState.parentState.name');
		        	if (currentState == "files") {
		        		Ember.run.next(function() {
		        			// If entering from files, do not animate.
		        			router.transitionTo('chats.swap');
		        			console.log("DO NOT ANIMATE");
			            });
		        	} else {
		        		Ember.run.next(function() {
		        			// If not entering from files, animate.
		        			router.transitionTo('chats.animate');
		        			console.log("ANIMATE");
			            });
		        	}
		        },
		        swap:  Em.Route.extend({
		        	connectOutlets: function(router, context) {
        				router.get('applicationController').connectOutlet('navpane', 'chatlist', {animate: false});
        				router.get('applicationController').connectOutlet('content', 'chatroom', {animate: false});
        			}
		        }),
		        animate:  Em.Route.extend({
		        	connectOutlets:  function(router, context) {
		        		router.get('applicationController').connectOutlet('navpane', 'chatlist', {animate: true});
		        		router.get('applicationController').connectOutlet('content', 'chatroom', {animate: true});
		        	}
		        })
        	}),
        	files:  Em.Route.extend({
        		route:  '/files',
        		exit: function(router) {
        			router.get('fileListController').set('content', {animate: false});
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
        			console.log("entering root.files from", router.get('currentState.parentState.name'));
		        	var currentState = router.get('currentState.parentState.name');
		        	if (currentState == "chats") {
		        		Ember.run.next(function() {
		        			// If entering from chats, do not animate.
		        			router.transitionTo('files.swap');
			            });
		        	} else {
		        		Ember.run.next(function() {
		        			// If not entering from chats, animate.
		        			router.transitionTo('files.animate');
			            });
		        	}
		        },
		        swap:  Em.Route.extend({
		        	connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('navpane', 'fileList', {animate: false});
        			router.get('applicationController').connectOutlet('content', 'fileInspector', {animate: false});
        			}
		        }),
		        animate:  Em.Route.extend({
		        	connectOutlets:  function(router, context) {
        			router.get('applicationController').connectOutlet('navpane', 'fileList', {animate: true});
        			router.get('applicationController').connectOutlet('content', 'fileInspector', {animate: true});
		        	}
		        })
        	})
	    })
	})
});

// Models

// Views

// Controllers

App.initialize();