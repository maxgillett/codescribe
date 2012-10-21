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
		isChats: stateFlag('chats')
  	}),
  	ApplicationView: Ember.View.extend({
    	templateName: 'application'
  	}),
  	ChatsController:  Em.Controller.extend({

  	}),
  	ChatsView:  Em.View.extend({
  		templateName:  'chats'
  	}),
  	ChatlistController:  Em.Controller.extend({
  		hideView: false
   	}),
  	ChatlistView:  Em.View.extend({
  		templateName:  'chatlist',
  		didInsertElement: function(){
  			var that = this;
  			$("#content").css({'left':'202'}).animate({
			    left: ["+=275", 'swing'],
			},{ duration: 500, queue: false });
        	this.$("#nav_pane").css({'left':'-=275', 'z-index':'-5'}).animate({
			    left: ["+=275", 'swing']
			},{ duration: 500, queue: false, complete: function() {
				that.$("#nav_pane").css('z-index',5);
			}});
    	},
    	_hideViewChanged: function() {
	        if (this.get('hideView')) {
	            this.hide();
	        }
	    }.observes('hideView'),
	    hide: function() {
	        var that = this;
	        this.$("#nav_pane").hide("slow", function() {
	            that.remove();
	        });
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
  	Router: Ember.Router.extend({
  		//location: 'history',
  		enableLogging: true,
  		goToDashboard:  Ember.Route.transitionTo('root.index'),
  		goToChats:  Ember.Route.transitionTo('root.chats'),
	    root:  Ember.Route.extend({
	    	index:  Ember.Route.extend({
        		route:  '/',
        		connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('dashboard');
        		}
        	}),
        	chats:  Ember.Route.extend({
        		route:  '/chats',
        		connectOutlets: function(router, context) {
        			router.get('applicationController').connectOutlet('chats');
        		}
        	}),
        	files:  Ember.Route.extend({
        		route:  '/files'
        	})
	    })
	})
});

// Models

// Views

// Controllers

App.initialize();