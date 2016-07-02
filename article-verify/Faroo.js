const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('./utils').request;

class Faroo extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('http://faroo.com?q=' + escape(subject))
			.then((data) => {
				// TODO post process, filter
				console.log('Data: ', data);
				// TODO return array of { title, url, pubDate, author }
				return data;
			}).catch((err) => {
				console.log('Failed');
			})
	}
}
