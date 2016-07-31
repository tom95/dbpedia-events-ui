const request = require('./utils').request;
const extractSubjectObject = require('./utils').extractSubjectObject;
const escape = require('querystring').escape;

var cache = {};
var lastFetch = 0;
var MIN_TIME_BETWEEN_FETCH = 1000 * 15;

function _fetchTrends(keyword) {
	console.log(`\t\tFetching trends for ${keyword} ...`);
	if (cache[keyword])
		return Promise.resolve(cache[keyword]);

	if (+new Date() - lastFetch < MIN_TIME_BETWEEN_FETCH)
		return Promise.resolve([]);

	lastFetch = +new Date();
	return request('GET', 'http://www.google.com/trends/fetchComponent', {
		q: '"' + keyword + '"',
		cid: 'TIMESERIES_GRAPH_0',
		export: '3'
	}, false).then((data) => {
		var regex = /"c":\[.+?new Date\((\d+),(\d+),(\d+).+?v":.+?f":"(\d+)"/mg;
		var res;
		var points = [];
		while (res = regex.exec(data)) {
			points.push({
				date: new Date(parseInt(res[1]), parseInt(res[2]), parseInt(res[3])),
				count: parseInt(res[4])
			});
		}

		cache[keyword] = points;

		return points;
	});
}

function fetchTrends(desc, tmpl) {
	return _fetchTrends(extractSubjectObject(desc, tmpl)[0]);
}

module.exports.fetchTrends = fetchTrends;

