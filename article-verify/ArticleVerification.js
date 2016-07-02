
class ArticleVerification {
	abstractExecuteFind(dateStart, dateEnd, subject, object, sentence) {
		return Promise.resolve();
	}

	abstractBaseRelevance() {
		return 0;
	}


	findArticles(digest) {
		var parts = extractSubjectObject(digest.desc, digest.tmpl);
		return abstractExecuteFind(new Date(new Date(digest.endTime) - dateVariance()),
								   new Date(new Date(digest.endTime) + dateVariance()));
	}

	extractSubjectObject(desc, tmpl) {
		var category = categoryForTmpl(tmpl);
		if (!category)
			return;

		var descTemplate = category.desc[category.tmpl.indexOf(tmpl)];
		if (!descTemplate)
			return;

        function escapeRegExp(str) {
            // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
        }
		var regex = escapeRegExp(descTemplate).replace(/%%.+?%%/g, "(.+)");

		var current = 0;
		var matches = line.match(regex);
		/*return descTemplate.replace(/%%(.+?)%%/g, function() {
			current++;
			return matches[current];
		});*/
	   return matches;
	}

	dateVariance() {
		return 1000 * 60 * 60 * 24 * 7;
	}
};

module.exports = ArticleVerification;
