const ArticleVerification = require('./ArticleVerification.js');
const escape = require('querystring').escape;
const request = require('../utils').request;

class NewYorkTimesArticleSearch extends ArticleVerification {
	abstractBaseRelevance() {
		return 0.7;
	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return request('GET', "https://api.nytimes.com/svc/search/v2/articlesearch.json", {
			'api-key': "7f812bab4c23418e82b5af2ba7d989c2",
			'q': '"' + subject + '"' + '"' + object + '"',
			'begin_date': this.convertDate(dateStart),
			'end_date': this.convertDate(dateEnd),
			'sort': "newest"
		}, true)
			.then((data) => {
				return data.response.docs.map(function(doc) {
					return {
						pubDate: new Date(doc.pub_date),
						excerpt: doc.snippet,
						url: doc.web_url,
						title: doc.headline.main
					}
				});
			});
	}

	convertDate(aDate) {
			let date = aDate.getFullYear().toString();
			if (aDate.getMonth() < 10 ) { date += '0' };
			date += aDate.getMonth().toString();
		   	if (aDate.getDate() < 10 ) { date += '0' };
			date += aDate.getDate().toString();

			return date;
	}
}

module.exports = NewYorkTimesArticleSearch;
