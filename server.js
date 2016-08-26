'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = new Hapi.Server();

server.connection({
	host: '0.0.0.0',
	port: 8000
});

var dogwaterOptions = {
  connections: {
    templateDB : {
			adapter: 'templateDisk',
			database: 'knowmin',
			user: 'root',
    },
    mongo: {
			adapter: 'mongo',
			database: 'mknowmin',
			user: 'root',
    }
  },
  adapters:{
     templateDisk : 'sails-mysql',
    mongo: 'sails-mongo'
  },
  models: [
    require('./models/post'),
    require('./models/article'),
    require('./models/mpost'),
    require('./models/marticle')]
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
    server.route(require('./routes/events'));

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

				sparqlQuery('SELECT DISTINCT ?digestid ?tmpl ?desc ?res \
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
				} LIMIT 100', 'http://events.dbpedia.org/sparql', function(err, res, body) {
					  if (err) {
						  console.log('Did not receive reply from SPARQL events server', err);
						  return reply('Internal error').code(500);
					  }

					  try {
						  var data = JSON.parse(body).results.bindings.map(function(digest) {
							  return {
								  id: digest.digestid.value,
								  tmpl: digest.tmpl.value,
								  desc: digest.desc.value,
								  res: digest.res.value
							  };
						  });
						} catch (e) {
						  console.log('Failed to decode SPARQL events reply', e);
						  return reply('Internal error').code(500);
					  }

						data = data.sort(function(a, b) {
							return (a.res != b.res && a.res < b.res) || (a.res == b.res && a.tmpl < b.tmpl) ? -1 : 1;
						});
						data.forEach(function(digest) {
							console.log(digest.res + ' -> ' + digest.tmpl);
						})

						var currentDigest = data[0];
						for (var i = 1; i < data.length; i++) {
							if (data[i].res == currentDigest.res && data[i].tmpl == currentDigest.tmpl) {
								currentDigest.desc += '<br>' + data[i].desc;
								data[i].remove = true;
							} else
								currentDigest = data[i];
						}
						data = data.filter(function(digest) { return !digest.remove; });

						Promise.all(data.map(function(digest) {
							return new Promise(function(resolve, reject) {
								sparqlQuery('select ?img { <' + digest.res + '> <http://xmlns.com/foaf/0.1/depiction> ?img }',
														'http://dbpedia-live.openlinksw.com/sparql',
														function(err, res, body) {
									digest.image = null;
									if (err) {
										console.log('Did not receive reply from SPARQL live server', err);
										return resolve(digest);
									}

									try {
										var data = JSON.parse(body);
										if (data.results.bindings.length)
											digest.image = data.results.bindings[0].img.value;

										return resolve(digest);
									} catch (e) {
										console.log('Failed to decode SPARQL live reply');
										console.log(body);
										return resolve(digest);
									}
								});
							});
						})).then(function(data) {
							console.log(data);
							sparqlMemoryCache[+startDay] = data;
							return reply(data);
						}, function(data) {
						});
				  });
		}
	});

	server.start((err) => {
		if (err)
			return console.log(err);

		console.log('Template API up and running at:', server.info.uri);

		// server.collections().post.find().exec((err, list) => console.log(list.length));



	  	var Post = server.collections().post;
	  	var mPost = server.collections().mpost;

	  	var Article = server.collections().article;
	  	var mArticle = server.collections().marticle;
		// mPost.find({ numArticles: {'>': 0} }).populate('articles').limit(4).exec(console.log);
			// mArticle.find().exec((err, l) => console.log(l.length));
		// createArticles();

	  // complicated mysql->mongodb migrate stuff
			/*Post.find().populate('articles').exec((err, list) => {
				if (err)
					return console.log('POST', err);
				console.log('POST: Creating', list.length, 'items ...');

				var pending = list.length;

				list.forEach(post => {
					var copy = {};
					Object.keys(post).forEach(key => copy[key] = post[key]);
					delete copy.articles;
					delete copy.id;

					mPost.create(copy).exec((err, newPost) => {
						if (--pending < 1) {
							mPost.find({ numArticles: {'>': 0} }).populate('articles').limit(4).exec(console.log);
							return console.log('PRETTY MUCH DONE');
						}

						if (err)
							return console.log('POST CREATE', err);

						console.log('POST: Created', newPost.id);

						if (post.articles.length < 1)
							return console.log('NO ARTICELS FOR', newPost.id);

						var listOfArticles = post.articles.map(article => (article.post = newPost.id, article));
						// assert
						listOfArticles.forEach(article => { if (article.post != newPost.id) process.exit(1); });

						mArticle.create(listOfArticles).exec((err, newArticles) => {
							if (err)
								return console.log('ARTICLE CREATE', err, newPost.id);

							console.log('ARTICLE CREATED', newArticles.length, newPost.id);
						});
					});
				});
			});*/
		// server.collections().post.find({processed:true}).exec((err, list) => console.log(err, list.length, list));
		// server.collections().post.update({id:'2128576743'}, {processed:false}).exec((err, list) => console.log(err, list.length, list));
		// require('./verify')(server.collections().post, server.collections().article);
	});
});
