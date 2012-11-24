String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Application

App = Em.Application.create({

	ApplicationController: Ember.Controller.extend({
    
  }),

	ApplicationView: Ember.View.extend({
  	templateName: 'application'
	}),

  HomeController:  Em.Controller.extend({}),

  HomeView:  Ember.View.extend({
    templateName: 'home'
  }),

  DashboardController:  Em.Controller.extend({
    addTeam: function() {
      App.store.createRecord(App.Team,  { name: "Untitled", slots: 5});
      App.store.commit();
    },
    addMember: function(team, val) {
      var query = App.store.find(App.User, { email: val });
      var exec = {
        trigger: function() {
          var user = query.get("firstObject");

          pendingUserRecord = team.get('members').createRecord({
            user: user,
            pending: true
          });

          user.get('members').pushObject(pendingUserRecord);
          
          App.store.commit();

          team.notifyPropertyChange('pending');
        }
      }
      query.addObserver('isLoaded', exec, 'trigger');
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


  PendingSingleMemberView: Ember.View.extend({
    templateName: 'pendingsinglemember',
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

  InvitationsController:  Em.Controller.extend({
    acceptInvitation: function(invite) {
      invite.set("accepted", true);
      App.store.commit();
    },
    deleteInvitation: function(invite) {
      invite.deleteRecord();
      App.store.commit();
    }
  }),

  InvitationsView:  Em.View.extend({
    templateName: 'invitations'
  }),

  SingleInvitationView: Ember.View.extend({
    templateName: 'singleinvitation',
    classNames: ["invitation"],
    accept: function() {
      console.log("deleting invitation");
      var invite = this.invite;
      App.router.get("invitationsController").acceptInvitation(invite);
    }
  }),

  RoomController:  Em.Controller.extend({
  }),

  RoomView:  Em.View.extend({
    templateName:  'room'
  }),

  ChatTextareaView:  Em.TextArea.extend({
    classNames: ["box"],
    keyDown: function(e) {
      if (e.which == 13) {
        e.preventDefault();
        var val = this.get("value");
      }
    }
  }),

	Router: Ember.Router.extend({
		location: 'history',
		enableLogging: true,
    goToRoom: function(router, view) {
      var team = view.context;
      App.router.transitionTo('root.rooms.room', team);
    },
    root:  Ember.Route.extend({
    	dashboard:  Ember.Route.extend({
    		route:  '/',
    		connectOutlets: function(router, context) {
          router.get("applicationController").connectOutlet('content', 'home')
    		}
      }),
      teams:  Em.Route.extend({
        route: '/teams',
        viewTeams: function(router, view) {
          App.router.transitionTo('index');
        },
        viewInvites: function(router, view) {
          App.router.transitionTo('invites');
        },
        index: Em.Route.extend({
          route: '/',
          connectOutlets: function(router, context) {
            var teams = App.store.findAll(App.Team);
            var invites = App.store.findAll(App.Invite);
            router.get('applicationController').connectOutlet('content', 'dashboard', {teams: teams, invites: invites});
          }
        }),
        invites: Em.Route.extend({
          route: '/invites',
          connectOutlets: function(router, context) {
            var invites = App.store.findAll(App.Invite);
            router.get('applicationController').connectOutlet('content', 'invitations', invites);
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
            router.get("applicationController").connectOutlet('content', 'room', team);
          },
          deserialize: function(router, params) {
            return App.store.find(App.Team, params.id);
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

DS.RESTAdapter.map("App.Team", { 
  primaryKey: "_id", 
  members: { 
    key: 'members',
    embedded: 'load'
  }
});

DS.RESTAdapter.map("App.User", {
  primaryKey: "_id"
});

DS.RESTAdapter.map("App.Member", {
  primaryKey: "_id", 
  team: {key: 'team'}, 
  user: {key: 'user'} 
});

DS.RESTAdapter.map("App.Invite", {
  primaryKey: "_id",
  team: {key: 'team'}, 
  user: {key: 'user'} 
});

// Store

App.store = DS.Store.create({
	revision: 8,
	adapter: DS.RESTAdapter.create({
    namespace: 'api/v1',
		mappings: {
      member: 'App.Member',
      team: 'App.Team',
      user: 'App.User',
      invite: 'App.Invite'
  	}
	})
});

// Join table models

App.Member = DS.Model.extend({
  team: DS.belongsTo('App.Team'),
  user: DS.belongsTo('App.User'),
  pending: DS.attr('boolean')
});

// Models

App.Team = DS.Model.extend({
  name: DS.attr('string'),
  slots: DS.attr('string'),

  members: DS.hasMany('App.Member'),

  accepted: function() {
    return this.get("members").filterProperty('pending', false).mapProperty('user');
  }.property('members.length'),

  pending: function() {
    return this.get("members").filterProperty('pending', true).mapProperty('user');
  }.property('members.length'),

  openSlots: function() {
    var len = this.get("slots") 
              - this.get("accepted").get("length")
              - this.get("pending").get("length");
    return new Array(len)
  }.property('members.length'),

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
  online: DS.attr('string'),

  // This should be able to be removed soon when
  // 'belongs to' will be allowed without a corresponding
  // hasmany. These will remain empty for now. 
  members: DS.hasMany('App.Member')
});

App.Invite = DS.Model.extend({
  name: DS.attr('string'),
  accepted: DS.attr('boolean')
});

App.initialize();
