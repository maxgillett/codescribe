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
    
  }),

	ApplicationView: Ember.View.extend({
  	templateName: 'application'
	}),

  DashboardController:  Em.ArrayController.extend({
    addTeam: function() {
      App.store.createRecord(App.Team,  { name: "Untitled", slots: 5});
      App.store.commit();
    },
    addMember: function(team, val) {
      var transaction = App.store.transaction();
      var pending = team.get("pending");
      var pendingUser = App.store.find(App.User, val) || val;
      pending.pushObject(pendingUser);
      transaction.add(pending);
      transaction.commit();
    }
  }),

  DashboardView:  Em.View.extend({
    templateName:  'dashboard',
  }),

  SingleMemberView: Ember.View.extend({
    templateName: 'singlemember',
    mouseEnter: function(e) {
      this.$('.pref').show();
    },
    mouseLeave: function(e) {
      this.$('.pref').hide();
    }
  }),

  SingleTeamView:  Em.View.extend({
    classNames: ["team"],
    rename: function() {
      this.team.toggleProperty("renaming");
    },
    didInsertElement: function() {
      // If element is not new, then return immediately
      if (this.get("team").id) return false;
      this.$().css(
        { 'position': 'relative',
          'width': '170px',
          'left':'30px',
          'top':'30px',
          'height':'190px'
        }
      );
      this.$().hide();
      this.$().fadeIn(300);
      this.$().animate(
        { width: ['225px', 'swing'],
          top: ['-=30px', 'swing'],
          left: ['-=30px', 'swing'],
          height: ['240px', 'swing']
        },
        { duration: 175, queue: false }
      );
    }
  }),

  NameTextareaView: Em.TextField.extend({
    didInsertElement: function() {
      this.$().focus();
      this.team.beginPropertyChanges();
    },
    keyDown: function(e) {
      if (e.which == 13) {
        e.preventDefault();
        var team = this.team;

        team.endPropertyChanges();
        team.toggleProperty("renaming");
      }
    },
    focusOut: function(e) {
      var team = this.team;

      team.endPropertyChanges();
      team.toggleProperty("renaming");
    }
  }),

  InviteTeamMemberTextareaView:  Em.TextField.extend({
    classNames: ["memb", "open"],
    keyDown: function(e) {
      if (e.which == 13) {
        e.preventDefault();
        var team = this.team
            val = this.get("value");

        App.router.get("dashboardController").addMember(team, val);
      }
    }
  }),

	Router: Ember.Router.extend({
		location: 'history',
		enableLogging: true,
    goToRoom: Ember.Router.transitionTo('rooms.room', 5),

    root:  Ember.Route.extend({
    	dashboard:  Ember.Route.extend({
    		route:  '/',
    		connectOutlets: function(router, context) {
    		}
      }),
      teams:  Em.Route.extend({
        route: '/teams',
        index: Em.Route.extend({
          route: '/',
          connectOutlets: function(router, context) {
            var teams = App.store.findAll(App.Team);
            router.get('applicationController').connectOutlet('content', 'dashboard', teams);
          }
        }),
        team: Em.Route.extend({
          route: '/:id',
          connectOutlets: function(router, team) {

          },
          deserialize: function(router, params) {
            return App.store.find(App.Team, params.id);
          }
        })
      }),
      rooms:  Em.Route.extend({
        route: '/rooms',
        room:  Em.Route.extend({
          route: '/:id',
          connectOutlets: function(router, team) {

          }
        })
      })
	 })

  })

});

// Configure sockets

var socket = io.connect('http://localhost:3000');

socket.on('connect', function () {

});


// Mapping

DS.RESTAdapter.map("App.Team", { primaryKey: "_id" });
DS.RESTAdapter.map("App.User", { primaryKey: "_id" });


// Store

App.store = DS.Store.create({
	revision: 7,
	adapter: DS.RESTAdapter.create({
    namespace: 'api/v1',
		mappings: {
          team: 'App.Team',
          user: 'App.User'
    	}
	})
});


// Models

App.Team = DS.Model.extend({
  name: DS.attr('string'),
  slots: DS.attr('string'),
  members: DS.hasMany('App.User'),
  pending: DS.hasMany('App.User'),
  openSlots: function() {
    var len = this.get("slots") 
              - this.get("members").get("length")
              - this.get("pending").get("length");
    return new Array(len)
  }.property('members.length', 'pending.length'),
  nameChanged: Ember.observer(function() {
    App.store.commit();
  }, 'name')
});

App.User = DS.Model.extend({
  uid: DS.attr('string'),
  name: DS.attr('string'),
  avatar: DS.attr('string'),
  username: DS.attr('string'),
  email: DS.attr('string'),
  online: DS.attr('string')
});

App.initialize();
