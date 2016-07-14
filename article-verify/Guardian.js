const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;

class Guardian extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.5;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		var query = {
			'api-key': 'a6d3cc9e-e062-4c06-8b9a-bf57d27eafe7',
			'q' : '"' + this.sanitise(subject) + '"' + ' AND ' + '"' + this.sanitise(object) + '"',
		   	'from-date' : dateStart.toISOString(),
		   	'to-date' : dateEnd.toISOString()
		};

		return request('GET', 'https://content.guardianapis.com/search', query, true)
			.then((data) => {
				return data.response.results.map(function(result) {
					return {
						pubDate : new Date(result.webPublicationDate),
						title: result.webTitle,
						url: result.webUrl
					}	
				});
			}).catch((err) => {
				console.log(err);
			})
	}
}

module.exports = Guardian;
