const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;
const apiKey = require('./apiKeys').financialTimes;

class FinancialTimes extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.1;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('POST','http://api.ft.com/content/search/v1?apiKey=' + apiKey,{queryString: subject}, true, {"Content-Type": "application/json"})
			.then((data) => {
				// TODO post process, filter
				console.log('Data: ', data.results[0].results);
				// TODO return array of { title, url, pubDate, author }
				return data;
			}).catch((err) => {
				console.log(err, err.failedData);
			})
	}
}

module.exports = FinancialTimes;
