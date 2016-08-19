const extractSubjectObject = require('../utils.js').extractSubjectObject;

class ArticleVerification {
	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return Promise.resolve();
	}

	abstractBaseRelevance() {
		return 0;
	}


	findArticles(digest) {
		var parts = extractSubjectObject(digest.desc, digest.tmpl);
		var centerDate = new Date(digest.endTime);

		console.log(digest);
		if (isNaN(centerDate.getTime())) {
			var timeMatch = digest.endTime.match(/^(\d{4})-(\d{2})-(\d{2})/);
			centerDate = new Date();
			centerDate.setFullYear(parseInt(timeMatch[1]));
			centerDate.setMonth(parseInt(timeMatch[2]) - 1);
			centerDate.setDate(parseInt(timeMatch[3]));
		}

		return this.abstractExecuteFind(new Date(+centerDate - this.dateVariance()),
								   new Date(+centerDate + this.dateVariance()), parts[0], parts[1], digest.desc);
	}

	dateVariance() {
		return 1000 * 60 * 60 * 24 * 7;
	}

	sanitise(string) {
		return string
			.replace(/[êéè]/gi, 'e')
			.replace(/[âä]/gi, 'a')
			.replace(/ü/gi, 'u')
			.replace(/ö/gi, 'o')
			.replace(/ß/gi, 'ss')
			.replace(/[^a-z0-9\s]/gi, '')
	}
};

module.exports = ArticleVerification;

module.exports.articleVerificationServices = {
    // 'faroo': new (require('../article-verify/Faroo.js'))(),
    'dieZeit': new (require('../article-verify/dieZeit.js'))(),
    // 'FinancialTimes': new (require('../article-verify/FinancialTimes.js')),
    'bing': new (require('../article-verify/Bing.js'))(),
    'newYorkTimes': new (require('../article-verify/NewYorkTimesArticleSearch.js'))(),
    'guardian': new (require('../article-verify/Guardian.js'))()
};

