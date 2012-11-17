var db = require('../../config/db')
  ,	xmpp = require('node-xmpp');

exports.show = function(req, res, next) {
	// var cl = new xmpp.Client({ jid: "codescribe@maxs-mbp",
	//                            password: "testing",
	//                            host: "localhost",
	//                            port: "5222"
	//                          });

	// cl.on('online', function() {
	//   console.log("Jabber client connected");

	//   // Update presence status to available
	//   cl.send(new xmpp.Element('presence', { type: 'available' }).
	//     c('show').t('chat')
	//    );

	//   // Join a room
	//   cl.send(new xmpp.Element('presence', { to: "room1@conference.maxs-mbp/codescribe" }).
	//     c('x', { xmlns: 'http://jabber.org/protocol/muc' })
	//   );
	// });

	// cl.on('stanza', function(stanza) {
	//   console.log(stanza);
	//   var body = stanza.getChild('body');
	//   if (!body) {
	//     return;
	//   }
	//   var message = body.getText();
	//   console.log(message);
	// });
}
