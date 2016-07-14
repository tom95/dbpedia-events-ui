const _httpRequest = require('request');
const querystring = require('querystring');
var sparqlMemoryCache = {};
var eventConfirmations = {};

// one of 'disabled', 'wiki', 'dbpedia'
const PICTURE_MODE = 'wiki';

var verificationServices = {
    // 'faroo': new (require('../article-verify/Faroo.js'))(),
    'dieZeit': new (require('../article-verify/dieZeit.js'))(),
    // 'FinancialTimes': new (require('../article-verify/FinancialTimes.js')),
    'bing': new (require('../article-verify/Bing.js'))(),
    'newYorkTimes': new (require('../article-verify/NewYorkTimesArticleSearch.js'))(),
    'guardian': new (require('../article-verify/Guardian.js'))()
};

// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
function stringHash(str) {
    var hash = 0, i, chr, len;
    if (str.length === 0) return hash;
    for (i = 0, len = str.length; i < len; i++) {
	chr   = str.charCodeAt(i);
	hash  = ((hash << 5) - hash) + chr;
	hash |= 0;
    }
    return hash;
}

function eventFromCachesById(id, cb) {
    Object.keys(sparqlMemoryCache).forEach((cache) => {
	sparqlMemoryCache[cache].forEach((digest) => {
	    if (digest.id == id)
		cb(digest);
	});
    })
}

/**
 * run the given query on the sparql endpoint at source. returns a promise
 * with the returned json data.
 */
function sparqlQuery(query, source) {
    return new Promise((resolve, reject) => {
        _httpRequest(source + '?query=' +
            querystring.escape(query) + '&format=json', (err, res, body) => {
            if (err)
                return reject(err);
            else {
                try {
                    var data = JSON.parse(body);
                    return resolve(data);
                } catch (e) {
                    return reject(e);
                }
            }
        });
    });
}

function httpRequest(method, url, params, parseJson) {
    return new Promise((resolve, reject) => {
	var config = {
	    method: method,
	    url: url
	};

	if (method == 'GET')
	    config.url += '?' + Object.keys(params).map((key) => {
		return querystring.escape(key) + '=' + querystring.escape(params[key]);
	    }).join('&');
	else
	    config.json = params;

	_httpRequest(config,
		     function (error, response, body) {
			 if (error)
			     return reject(error);
			 else if (parseJson)
			     try {
				 return resolve(JSON.parse(body));
			     } catch (e) {
				 return reject(e);
			     }
			 else
			     return resolve(body);
		     });
    }) ;
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
        });
	item.id = stringHash(item.digestid + item.tmpl + item.res);
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

    return data.filter((digest) => {
        return !digest.remove;
    });
}

function addConfirmCounts(data) {
    data.forEach(function(digest) {
	digest.confirm = eventConfirmations[digest.id] ||
	    { confirm: 0, disconfirm: 0 };
    });
    return data;
}

/**
 * given a reply from the dbpedia events endpoint fetch image links for each resource
 */
function fetchImagesForResources(data) {
    if (PICTURE_MODE == 'disabled')
        return Promise.resolve(data);

    if (PICTURE_MODE == 'wiki')
	return Promise.all(data.map((digest) => {
	    return new Promise((resolve, reject) => {
		var entity = digest.res.match(/\/([^/]+)$/)[1];
		httpRequest('GET', 'https://en.wikipedia.org/w/api.php', {
		    action: 'query',
		    prop: 'extracts|pageimages|revisions|info',
		    redirects: true,
		    exintro: true,
		    explaintext: true,
		    piprop: 'thumbnail',
		    pithumbsize: '300',
		    rvprop: 'timestamp',
		    inprop: 'url',
		    indexpageids: true,
		    titles: entity,
		    format: 'json'
		}, true)
		.then((data) => {
		    var pages = data.query.pages;
		    var page = pages[Object.keys(pages)[0]];
		    digest.image = page.thumbnail ? page.thumbnail.source : null;
		    resolve(digest);
		}, (err) => {
		    console.log('Failed to fetch image', digest.res);
		    digest.image = null;
		    resolve(digest);
		});
	    });
	}));

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

function queryCustomEventsByDay(template) {
    // var cached = getEventsFromCache('custom-' + (+template.start));
    // if (cached) return Promise.resolve(cached);

    return httpRequest('POST', "http://141.89.225.50:9000/api/testconfig", template)
        .then((data) => {
            console.log("Test API respone: ", data);
            return data;
        })
        .then(processEventQueryData)
        .then(condenseEvents)
        .then(fetchImagesForResources)
    // .then((list) => {
    // 	cacheEventQuery('custom-' + (+startDay), list);
    // 	return list;
    // });
}

function queryEventsByDay(startDay) {

    var cached = getEventsFromCache('event-' + (+startDay));
    if (cached) return Promise.resolve(cached);

    var endDay = new Date(+startDay + 24 * 60 * 60 * 1000);

    return sparqlQuery('SELECT DISTINCT ?digestid ?tmpl ?desc ?res ?endTime \
		{ \
			?s a <http://events.dbpedia.org/ns/core#Event> . \
			?s <http://purl.org/dc/terms/description> ?desc . \
			?s <http://events.dbpedia.org/ns/core#update> ?u . \
			?s <http://events.dbpedia.org/ns/core#digest> ?digest . \
			?s <http://www.w3.org/ns/prov#wasDerivedFrom> ?tmpl . \
			?tmpl a <http://events.dbpedia.org/ns/core#DigestTemplate> . \
			?digest <http://www.w3.org/ns/prov#endedAtTime> ?endTime . \
			?digest <http://purl.org/dc/terms/identifier> ?digestid . \
			FILTER ( ?endTime >= "' + startDay.toISOString() + '"^^xsd:date && \
							 ?endTime < "' + endDay.toISOString() + '"^^xsd:date) \
			?u a <http://webr3.org/owl/guo#UpdateInstruction> . \
			?u <http://webr3.org/owl/guo#target_subject> ?res . \
		}', 'http://events.dbpedia.org/sparql')
        .then(processEventQueryData)
        .then(condenseEvents)
         .then(addConfirmCounts)
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

        queryEventsByDay(startDay).then((list) => {
                reply(list);
            },
            (err) => {
                console.log(err);
                reply('Internal Error').code(500);
            });
    }
},
    {
        path: '/events/custom',
        method: 'POST',
        handler: (request, reply) => {
            queryCustomEventsByDay(request.payload)
                .then((list) => {
                        reply(list);
                    },
                    (err) => {
                        console.log(err);
                        reply('Internal Error').code(500);
                    });
        }
    },
    {
        path: '/events/resource',
        method: 'GET',
        handler: (request, reply) => {
            var resource = request.query.resource;
            if (!resource)
                return reply('Missing param resource').code(403);

            queryEventsByResource(resource).then((list) => {
                    reply(list);
                },
                (err) => {
                    console.log(err);
                    reply('Internal Error').code(500);
                });
        }
    },
    {
	path: '/events/verify',
	method: 'GET',
	handler: (request, reply) => {
	    Promise.all(Object.keys(verificationServices).map(function(serviceId) {
		return verificationServices[serviceId].findArticles({
		    desc: request.query.desc,
		    tmpl: request.query.tmpl,
		    endTime: request.query.endTime
		}).then((data) => {
		    console.log(serviceId, ' => ', data);
		    return data.map((item) => {
			item.source = serviceId;
			return item;
		    });
		});
	    })).then((sources) => {
		return reply([].concat.apply([], sources));
	    }).catch((err) => {
		console.log('Failed to grab data', err);
		return reply('Failed to grab data: ' + JSON.stringify(err)).code(500);
	    });
	}
    },
    {
	path: '/events/verify/{service}',
	method: 'GET',
	handler: (request, reply) => {
	    var service = verificationServices[request.params.service];
	    if (!service)
		return reply('No such service').code(400);

	    service.findArticles({
		desc: request.query.desc,
		tmpl: request.query.tmpl,
		endTime: request.query.endTime
	    }).then((data) => {
		return reply(data.map((item) => {
		    item.source = request.params.service;
		    return item;
		}));
	    }, (err) => {
		console.log('Failed to grab data', err)
		return reply('Failed to grab data' + JSON.stringify(err)).code(500);
	    });
	}
    },
    {
	path: '/events/confirm/{id}',
	method: 'PUT',
	handler: (request, reply) => {
	    if (!eventConfirmations[request.params.id])
		eventConfirmations[request.params.id] = { confirm: 0, disconfirm: 0 };

	    if (request.payload.confirm)
		eventConfirmations[request.params.id].confirm++;
	    else
		eventConfirmations[request.params.id].disconfirm++;

	    eventFromCachesById(request.params.id, (digest) => {
		if (request.payload.confirm)
		    digest.confirm.confirm++;
		else
		    digest.confirm.disconfirm++;
	    });

	    reply({ confirm: eventConfirmations[request.params.id] });
	}
    }
];
