var queryEventsByDay = require('./routes/events').queryEventsByDay;
var trendsVerify = require('./trends-verify');

module.exports = function(Post) {
	var firstDay = new Date(2015, 10, 10);
	var day = firstDay;
	queryEventsByDay(day).then((list) => {
		return Promise.all(list.map((post) => {
			post.day = day;
			return Promise.all([
				trendsVerify(post.desc, post.tmpl),
				articleVerify(post.desc, post.tmpl)
			]).then((data) => {
				var trends = data[0];
				var articles = data[1];
				post.numArticles = articles.length;
				post.trends = trends;

				Post.create(post);
			});
		}));
		console.log(list);
	});
};

