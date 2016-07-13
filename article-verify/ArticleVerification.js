
class ArticleVerification {
	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return Promise.resolve();
	}

	abstractBaseRelevance() {
		return 0;
	}


	findArticles(digest) {
		var parts = this.extractSubjectObject(digest.desc, digest.tmpl);
		var timeMatch = digest.endTime.match(/^(\d{4})-(\d{2})-(\d{2})/);
		var centerDate = new Date();
		centerDate.setFullYear(parseInt(timeMatch[1]));
		centerDate.setMonth(parseInt(timeMatch[2]) - 1);
		centerDate.setDate(parseInt(timeMatch[3]));

		return this.abstractExecuteFind(new Date(+centerDate - this.dateVariance()),
								   new Date(+centerDate + this.dateVariance()), parts[0], parts[1], digest.desc);
	}

	extractSubjectObject(desc, tmpl) {
		function escapeRegExp(str) {
			// http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
			return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		}

		var regex = escapeRegExp(tmpl).replace(/%%.+?%%/g, "(.+)");

		var current = 0;
		return desc.match(regex).slice(1);
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
