'use strict';

const Hapi = require('hapi');
const Path = require('path');
const httpRequest = require('request');
const querystring = require('querystring');

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
	
	// Serve static assets
	server.route({
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: { path: 'public' }
		}
	});

	var sparqlMemoryCache = {};

	server.route({
		method: 'GET',
		path: '/events',
		handler: (request, reply) => {
			var day = request.query.day;
			if (!day)
				return reply('Missing param day').code(403);
			var startDay = new Date(day);
			startDay.setMinutes(0);
			startDay.setHours(0);
			startDay.setSeconds(0);
			startDay.setMilliseconds(0);

			if (sparqlMemoryCache[+startDay])
				return reply(sparqlMemoryCache[+startDay]);

			var endDay = new Date(+startDay + 24 * 60 * 60 * 1000);

			httpRequest('http://events.dbpedia.org/sparql?query=' +
				querystring.escape('SELECT DISTINCT ?digestid ?tmpl ?desc ?res \
				{ \
				  ?s a <http://events.dbpedia.org/ns/core#Event> . \
				  ?s <http://purl.org/dc/terms/description> ?desc . \
				  ?s <http://events.dbpedia.org/ns/core#update> ?u . \
				  ?s <http://events.dbpedia.org/ns/core#digest> ?digest . \
				  ?s <http://www.w3.org/ns/prov#wasDerivedFrom> ?tmpl . \
				  ?tmpl a <http://events.dbpedia.org/ns/core#DigestTemplate> . \
				  ?digest <http://www.w3.org/ns/prov#endedAtTime> ?endTime . \
				  ?digest <http://purl.org/dc/terms/identifier> ?digestid . \
				  FILTER ( ?endTime > "' + startDay.toISOString() + '"^^xsd:date && ?endTime < "' + endDay.toISOString() + '"^^xsd:date) \
				  ?u a <http://webr3.org/owl/guo#UpdateInstruction> . \
				  ?u <http://webr3.org/owl/guo#target_subject> ?res . \
				} LIMIT 100') + '&format=json', function(err, res, body) {
					  if (err) {
						  console.log('Did not receive reply from SPARQL server', err);
						  return reply('Internal error').code(500);
					  }

					  try {
						  var data = JSON.parse(body).results.bindings.map(function(digest) {
							  return {
								  id: digest.digestid.value,
								  tmpl: digest.tmpl.value,
								  desc: digest.desc.value,
								  res: digest.desc.value
							  };
						  });
						  sparqlMemoryCache[+startDay] = data;
						  return reply(data);
					  } catch (e) {
						  console.log('Failed to decode SPARQL reply', e);
						  return reply('Internal error').code(500);
					  }
				  });
		}
	});

	server.start(() => {
		console.log('Template API up and running at:', server.info.uri);
	});
});
