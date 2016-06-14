const httpRequest = require('request');
const querystring = require('querystring');
var sparqlMemoryCache = {};

/**
 * run the given query on the sparql endpoint at source. returns a promise
 * with the returned json data.
 */
function sparqlQuery(query, source) {
	return new Promise((resolve, reject) => {
		httpRequest(source + '?query=' +
								querystring.escape(query) + '&format=json', (err, res, body) => {
			if (err)
				return reject(err);
			else {
				try {
					var data = JSON.parse(body);
					return resolve(data);
				} catch(e) {
					return reject(e);
				}
			}
		});
	});
}

/**
 * cache a query result by a given hash
 */
function cacheEventQuery(hash, data) {
	sparqlMemoryCache[hash] = data;
}

/**
 * return a cached result by hash
 */
function getEventsFromCache(hash) {
	return sparqlMemoryCache[hash];
}

/**
 * extract relevant fields of sparql query return
 */
function processEventQueryData(data) {
	var data = data.results.bindings.map((digest) => {
		var item = {};
		var keys = Object.keys(digest);
		keys.forEach((key) => {
			item[key] = digest[key].value;
		})
		return item;
	});

	return data;
}

/**
 * Condense related events into a single one
 */
function condenseEvents(data) {
	if (!data.length)
		return data;

	data = data.sort((a, b) => {
		return (a.res != b.res && a.res < b.res) || (a.res == b.res && a.tmpl < b.tmpl) ? -1 : 1;
	});

	// TODO check time distance so we can also employ the logic for per resource queries
	var currentDigest = data[0];
	for (var i = 1; i < data.length; i++) {
		if (data[i].res == currentDigest.res && data[i].tmpl == currentDigest.tmpl) {
			currentDigest.desc += '<br>' + data[i].desc;
			data[i].remove = true;
		} else
			currentDigest = data[i];
	}

	return data.filter((digest) => { return !digest.remove; });
}

/**
 * given a reply from the dbpedia events endpoint fetch image links for each resource
 */
function fetchImagesForResources(data) {
	return Promise.all(data.map((digest) => {
		return new Promise((resolve, reject) => {
			sparqlQuery('select ?img { <' + digest.res + '> <http://xmlns.com/foaf/0.1/depiction> ?img }',
												 'http://dbpedia-live.openlinksw.com/sparql')
			.then((data) => {
				if (data.results.bindings.length)
					digest.image = data.results.bindings[0].img.value;
				else
					digest.image = null;
				resolve(digest);
			}, (err) => {
				console.log('Failed to fetch image', digest.res);
				digest.image = null;
				resolve(digest);
			});
		});
	}));
}

function queryEventsByDay(startDay) {

	var cached = getEventsFromCache('event-' + (+startDay));
	if (cached) return Promise.resolve(cached);

	var endDay = new Date(+startDay + 24 * 60 * 60 * 1000);

	return sparqlQuery('SELECT DISTINCT ?digestid ?tmpl ?desc ?res \
		{ \
			?s a <http://events.dbpedia.org/ns/core#Event> . \
			?s <http://purl.org/dc/terms/description> ?desc . \
			?s <http://events.dbpedia.org/ns/core#update> ?u . \
			?s <http://events.dbpedia.org/ns/core#digest> ?digest . \
			?s <http://www.w3.org/ns/prov#wasDerivedFrom> ?tmpl . \
			?tmpl a <http://events.dbpedia.org/ns/core#DigestTemplate> . \
			?digest <http://www.w3.org/ns/prov#endedAtTime> ?endTime . \
			?digest <http://purl.org/dc/terms/identifier> ?digestid . \
			FILTER ( ?endTime > "' + startDay.toISOString() + '"^^xsd:date && \
							 ?endTime < "' + endDay.toISOString() + '"^^xsd:date) \
			?u a <http://webr3.org/owl/guo#UpdateInstruction> . \
			?u <http://webr3.org/owl/guo#target_subject> ?res . \
		}', 'http://events.dbpedia.org/sparql')
	.then(processEventQueryData)
	.then(condenseEvents)
	.then(fetchImagesForResources)
	.then((list) => {
		cacheEventQuery('event-' + (+startDay), list);
		return list;
	});
}

function queryEventsByResource(resource) {
	var cached = getEventsFromCache('resource-' + resource);
	if (cached) return Promise.resolve(cached);

	return sparqlQuery('SELECT DISTINCT ?digestid ?tmpl ?desc ?endTime {' +
							  '?s a <http://events.dbpedia.org/ns/core#Event> .' +
							  '?s <http://purl.org/dc/terms/description> ?desc .' +
							  '?s <http://events.dbpedia.org/ns/core#update> ?u .' +
							  '?s <http://events.dbpedia.org/ns/core#digest> ?digest .' +
							  '?s <http://www.w3.org/ns/prov#wasDerivedFrom> ?tmpl .' +
							  '?tmpl a <http://events.dbpedia.org/ns/core#DigestTemplate> .' +
							  '?digest <http://www.w3.org/ns/prov#endedAtTime> ?endTime .' +
							  '?digest <http://purl.org/dc/terms/identifier> ?digestid .' +
							  '?u a <http://webr3.org/owl/guo#UpdateInstruction> .' +
							  '?u <http://webr3.org/owl/guo#target_subject> <' + resource + '> .' +
							'} LIMIT 100', 'http://events.dbpedia.org/sparql')
	.then(processEventQueryData)
	.then((list) => {
		cacheEventQuery('resource-' + resource, list);
		return list;
	});
}

module.exports = [{
	path: '/events/day',
	method: 'GET',
	handler: (request, reply) => {
		var day = request.query.day;
		if (!day)
			return reply('Missing param day').code(403);

		var startDay = new Date(day);
		startDay.setMinutes(0);
		startDay.setHours(0);
		startDay.setSeconds(0);
		startDay.setMilliseconds(0);

		queryEventsByDay(startDay).then((list) => { reply(list); },
																		(err) => { console.log(err); reply('Internal Error').code(500); });
	}
},
{
	path: '/events/resource',
	method: 'GET',
	handler: (request, reply) => {
		var resource = request.query.resource;
		if (!resource)
			return reply('Missing param resource').code(403);

		queryEventsByResource(resource).then((list) => { reply(list); },
																				 (err) => { console.log(err); reply('Internal Error').code(500); });
	}
}]
