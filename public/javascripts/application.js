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

	autoinit: false,

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
  		targetState: "",
  		goToDashboard:  function() {
  			this.set("targetState", "index");
  			App.router.transitionTo('root.index');
  		},
  		goToChats:  function() {
  			this.set("targetState", "chats");
  			App.router.transitionTo('root.chats')
  		},
  		goToFiles:  function() {
  			this.set("targetState", "files");
			App.router.transitionTo('root.files')
		},
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
        			// If target state is index, then animate destruction of element
        			var animate = (App.router.targetState == "index") ? true : false;
        			router.get('chatlistController').set('content', {animate: animate});
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
		        	var currentState = router.get('currentState.name');
        			var animate = (currentState == "index") ? true : false;
		        	this.set("animate", animate)
		        },
		        connectOutlets: function(router, context) {
		        	var doAnimate = this.get("animate");
        			router.get('applicationController').connectOutlet('navpane', 'chatlist', {animate: doAnimate});
        			router.get('applicationController').connectOutlet('content', 'chatroom', {animate: doAnimate});
        		}
        	}),
        	files:  Em.Route.extend({
        		route:  '/files',
        		exit: function(router) {
        			// If target state is index, then animate destruction of element
        			var animate = (App.router.targetState == "index") ? true : false;
        			router.get('fileListController').set('content', {animate: animate});
        			router.get('applicationController').disconnectOutlet('navpane');
        		},
        		enter: function(router) {
		        	var currentState = router.get('currentState.name');
		        	console.log(currentState);
        			var animate = (currentState == "index") ? true : false;
		        	this.set("animate", animate)
		        },
		        connectOutlets: function(router, context) {
		        	var doAnimate = this.get("animate");
        			router.get('applicationController').connectOutlet('navpane', 'fileList', {animate: doAnimate});
        			router.get('applicationController').connectOutlet('content', 'fileInspector', {animate: doAnimate});
        		}
        	})
	    })
	})
});

// Models

// Views

// Controllers

App.initialize();