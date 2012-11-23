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

  HomeController:  Em.Controller.extend({}),

  HomeView:  Ember.View.extend({
    templateName: 'home'
  }),

  DashboardController:  Em.Controller.extend({

    addTeam: function() {
      var team = App.store.createRecord(App.Team,  { name: "Untitled", slots: 5});
      var exec = {
        trigger: function() {
          team.notifyPropertyChange('members');
        }
      };

      team.addObserver('memberUsers.length', exec, 'trigger');
      App.store.commit();
    },
    addMember: function(team, val) {
      var query = App.store.find(App.User, { email: val });
      var exec = {
        trigger: function() {
          var pendingUser = query.get("firstObject");

          pendingUserRecord = team.get('pendingUsers').createRecord({
            user: pendingUser
          });

          pendingUser.get('pendingUsers').pushObject(pendingUserRecord);
          
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
  memberUsers: { 
    key: 'members_users',
    embedded: 'load'
  },
  pendingUsers: {
    key: 'pending_users',
    embedded: 'load'
  } 
});

DS.RESTAdapter.map("App.User", {
  primaryKey: "_id", 
  memberUsers: { 
    key: 'members_users' 
  },
  pendingUsers: {
    key: 'pending_users'
  } 
});

DS.RESTAdapter.map("App.MemberUser", {
  primaryKey: "_id", 
  team: {key: 'team'}, 
  user: {key: 'user'} 
});

DS.RESTAdapter.map("App.PendingUser", { 
  primaryKey: "_id", 
  team: {key: 'team'}, 
  user: {key: 'user'} 
});

DS.RESTAdapter.map("App.Invite", {
  primaryKey: "_id"
});

// Store

App.store = DS.Store.create({
	revision: 8,
	adapter: DS.RESTAdapter.create({
    namespace: 'api/v1',
		mappings: {
          team: 'App.Team',
          user: 'App.User',
          memberUser: 'App.MemberUser',
          pendingUser: 'App.PendingUser',
          invite: 'App.Invite'
    	}
	})
});


// Join table models

App.MemberUser = DS.Model.extend({
  team: DS.belongsTo('App.Team'),
  user: DS.belongsTo('App.User')
});

App.PendingUser = DS.Model.extend({
  team: DS.belongsTo('App.Team'),
  user: DS.belongsTo('App.User')
});


// Models

App.Team = DS.Model.extend({
  name: DS.attr('string'),
  slots: DS.attr('string'),

  memberUsers: DS.hasMany('App.MemberUser'),
  pendingUsers: DS.hasMany('App.PendingUser'),

  members: function() {
    var that = this;
    var teamUsers = App.store.filter(App.MemberUser, function(hash) {
      if (hash.get('team').id == that.id) { return true; }
    });

    return teamUsers.mapProperty('user');
  }.property('memberUsers'),

  pending: function() {
    var that = this;
    var teamUsers = App.store.filter(App.PendingUser, function(hash) {
      if (hash.get('team').id == that.id) { return true; }
    });

    // This is a hack. Why am I having to call "uniq" here"
    return teamUsers.mapProperty('user').uniq();
  }.property('pendingUsers'),

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
  online: DS.attr('string'),

  memberUsers: DS.hasMany('App.MemberUser'),
  pendingUsers: DS.hasMany('App.PendingUser'),

  teams: function() {
    var that = this;
    var teamUsers = App.store.filter(App.MemberUser, function(hash) {
      if (hash.get('user').get("id") == that.id) { return true; }
    });

    return teamUsers.mapProperty('team');
  }.property('membersUsers'),

  pending: function() {
    var that = this;
    var teamUsers = App.store.filter(App.PendingUser, function(hash) {
      if (hash.get('user').get("id") == that.id) { return true; }
    });

    return teamUsers.mapProperty('team');
  }.property('pendingUsers'),

});

App.Invite = DS.Model.extend({
  name: DS.attr('string'),
  accepted: DS.attr('string')
});


App.initialize();
