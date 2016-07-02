const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;

class Faroo extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('GET', 'http://faroo.com', { q: subject }, true)
			.then((data) => {
				// TODO post process, filter
				console.log('Data: ', data);
				// TODO return array of { title, url, pubDate, author, imageUrl }
				return data;
			});
	}
}

module.exports = Faroo;
