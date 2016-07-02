
class ArticleVerification {
	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return Promise.resolve();
	}

	abstractBaseRelevance() {
		return 0;
	}


	findArticles(digest) {
		var parts = this.extractSubjectObject(digest.desc, digest.tmpl);
		return this.abstractExecuteFind(new Date(new Date(digest.endTime) - this.dateVariance()),
								   new Date(new Date(digest.endTime) + this.dateVariance()), parts[0], parts[1], digest.desc);
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
};

module.exports = ArticleVerification;
