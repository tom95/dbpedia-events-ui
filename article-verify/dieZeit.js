const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;

class dieZeit extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('GET','http://api.zeit.de/content', { 
			q: '"' + subject + '" "' + object + '"',
			api_key: '198ae7c88a349baaeecc3ae4f2620334cca56dd71a7d8d2a5bd4'
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
