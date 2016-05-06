'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = new Hapi.Server();

server.connection({ 
	host: 'localhost', 
	port: 8000 
});

server.register(require('inert'), function(err) {
	if (err) throw err;

	// Serve static assets
	server.route({
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: { path: 'public' }
		}
	});

	// Serve index.html
	server.route({
		method: 'GET',
		path: '/',
		handler: {
			file: (request) => { return 'public/index.html'; }
		}
	});

	// Example route in most simpe form
	server.route({
		method: 'GET',
		path:'/hello', 
		handler: (request, reply) => {
			return reply('hello world');
		}
	});

	// Example route with parameter
	server.route({
		method: 'GET',
		path: '/test/{name}',
		handler: (request, reply) => {
			return reply('Hello ' + request.params.name);
		}
	});

	server.start((err) => {
		if (err) throw err;

		console.log('Server running at:', server.info.uri);
	});
});

