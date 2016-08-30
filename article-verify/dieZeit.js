const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;
const apiKey = require('./apiKeys').dieZeit;

class dieZeit extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('GET','http://api.zeit.de/content', { 
			q: '"' + subject + '" "' + object + '"',
			api_key: apiKey
		}, true)
			.then((data) => {
				//console.log('Data: ', data.matches);
				return data.matches.map((article) => {
					return {
						pubDate: new Date(article.release_date),
						url: article.href,
						title: article.title,
						excerpt: article.teaser_text
					};
				});
			}).catch((err) => {
				console.log(err);
			})
	}
}

module.exports = dieZeit;
