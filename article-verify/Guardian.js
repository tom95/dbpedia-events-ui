const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;
const apiKey = require('./apiKeys').guardian;

class Guardian extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.5;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		var query = {
			'api-key': apiKey,
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
