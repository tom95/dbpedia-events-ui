const ArticleVerification = require('./ArticleVerification.js');
const request = require('../utils').request;

const BASE_URL = "https://api.cognitive.microsoft.com/bing/v5.0/news/search";

class Bing extends ArticleVerification {
	abstractBaseRelevance() {
		return 1;
	}

	_formatBingResult(data) {
		return data.value.map(function (item) {
			return {
				title: item.name,
				url: item.url,
				excerpt: item.description,
				pubDate: new Date(item.datePublished),
				author: item.provider[0].name,
				imageUrl: item.image ? item.image.contentUrl : ""
			}
		})

	}

	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		var params = {
			q: '"' + subject + '"' + '"' + object + '"',
			count: 100,
			mkt: 'en-US',
			'News.SortBy': 'Date'
		};
		var headers = {
			"Ocp-Apim-Subscription-Key": "2a7aa62344b04e1da71eb76e5bd39b1a"
		};
		return request('GET', BASE_URL, params, true, headers)
			.then((data) => {
				// console.log('Data: ', data);
				return this._formatBingResult(data).filter((item) => {
					return item.pubDate >= dateStart && item.pubDate <= dateEnd;
				}).sort((a, b) => { return  b.pubDate - a.pubDate });
			});
	}
}

module.exports = Bing;
