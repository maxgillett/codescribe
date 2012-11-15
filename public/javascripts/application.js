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
      console.log("Creating a new team");
      App.store.createRecord(App.Team,  { name: "Untitled", slots: 5 });
      App.store.commit();
    },
    addMember: function(team, member) {
      console.log("Creating a new member");
      var pending = team.get("pending");
      var pendingUser = App.store.find(App.User, "50a1db927b1b2c8d71000001");
      pending.pushObject(pendingUser);
    }
  }),

  DashboardView:  Em.View.extend({
    templateName:  'dashboard'
  }),

  SingleTeamView:  Em.View.extend({
    classNames: ["team"]
  }),

  InviteTeamMemberTextareaView:  Em.TextField.extend({
    classNames: ["memb", "open"],
    keyDown: function(e) {
      if (e.which == 13) {
        e.preventDefault();
        var team = this.get("team")
            member = this.get("value");
        App.router.get("dashboardController").addMember(team, member);
      }
    }
  }),

	Router: Ember.Router.extend({
		location: 'history',
		enableLogging: true,

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
      })
	 })

  })

});

// Configure sockets

var socket = io.connect('http://localhost:3000');

socket.on('connect', function () {

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
  }
});

})();


App.SOCKETadapter = DS.Adapter.extend({

  serializer: DS.SOCKETserializer.create(),

	find:  function(store, type, id) {
    debugger;
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

App.SOCKETadapter.map("App.Team", { primaryKey: "_id" });
App.SOCKETadapter.map("App.User", { primaryKey: "_id" });


// Store

App.store = DS.Store.create({
	revision: 7,
	adapter: App.SOCKETadapter.create({
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
  }.property('members.length', 'pending.length')
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
