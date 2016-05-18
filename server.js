'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = new Hapi.Server();

server.connection({
	host: 'localhost',
	port: 8000
});

var dogwaterOptions = {
  connections: {
    templateDB : {
      adapter: 'templateDisk'
    }
  },
  adapters:{
     templateDisk : 'sails-disk'
  },
  models: [require('./models/template')]
};


server.register([{
    register: require('dogwater'),
    options: dogwaterOptions
	},
	{
	register: require('inert'),
	options: {}
}
], function (err) {
    if (err) { return console.log(err); }

    server.route(require('./routes/template'));

	// Serve index.html
	server.route({
		method: 'GET',
		path: '/',
		handler: {
			file: (request) => { return 'public/index.html'; }
		}
	});

    server.start(function () {
      console.log('Template API up and running at:', server.info.uri);
    });
});
