const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;

class dieZeit extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('GET','http://api.zeit.de/content', { q: subject, api_key: '0d47a1ca0d95a5a7b68eda826ccb6889149b3f7ad47a9b5fb2bd'}, true)
			.then((data) => {
				// TODO post process, filter
				console.log('Data: ', data);
				// TODO return array of { title, url, pubDate, author }
				return data;
			}).catch((err) => {
				console.log(err);
			})
	}
}

module.exports = dieZeit;
