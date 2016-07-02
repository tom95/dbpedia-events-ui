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
			q: subject,
			count: 10,
			mkt: 'en-US'
		};
		var headers = {
			"Ocp-Apim-Subscription-Key": "95f06c2ab71b4f7fbcdbb8d5b6d33fcf"
		};
		return request('GET', BASE_URL, params, true, headers)
			.then((data) => {
				// TODO post process, filter
				// console.log('Data: ', data);
				// TODO return array of { title, url, pubDate, author, imageUrl }
				return this._formatBingResult(data);
			});
	}
}

module.exports = Bing;