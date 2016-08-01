var queryEventsByDay = require('./routes/events').queryEventsByDay;
var trendsVerify = require('./trends-verify').fetchTrends;
var articleVerificationServices = require('./article-verify/ArticleVerification').articleVerificationServices;
var Promise = require('bluebird');

var Post, Article;

Promise.config({
	warnings: true,
	cancellation: true,
	monitoring: true,
	longStackTraces: true,
	warnings: { wForgottenReturn: true }
});
Promise.onPossiblyUnhandledRejection(function(e, promise) { throw e; });
process.on("unhandledRejection", function(reason, promise) { throw reason; });
process.on("rejectionHandled", function(promise) { console.log('rejection handled', promise); });

function articleVerify(desc, tmpl, endTime) {
	return Promise.all(Object.keys(articleVerificationServices).map(serviceId => {
		console.log(`\t\tFetching articles from ${serviceId} ...`);
		return articleVerificationServices[serviceId].findArticles({
			desc: desc,
			tmpl: tmpl,
			endTime: endTime
		}).then(data => {
			if (!data) return [];
			console.log(`\t\t.... done (${serviceId})`)
			return data.map(i => (i.source = serviceId, i));
		});
	})).then(serviceReplies => {
		var articles = [].concat.apply([], serviceReplies);

		return new Promise((resolve, reject) => {
			Article.create(articles).exec((err, list) => {
				if (err) return reject(err);
				resolve(list);
			});
		});
	});
}

function verifyPost(post) {
	var tmpl = categoryForTmpl(post.tmpl).desc[0];
	var p = [
		trendsVerify(post.desc, tmpl),
		articleVerify(post.desc, tmpl, post.endTime)
	];
	return Promise.all(p).then(data => {
		let trends = data[0];
		let articles = data[1];
		post.numArticles = articles.length;
		post.trends = trends;
		post.articles = data[1].map(article => article.id);
		console.log(`\t\tSaving \`${post.desc}\` ...`);

		return new Promise((resolve, reject) => {
			Post.create(post).exec((err, created) => {
				if (err)
					return reject(err);
				resolve(created);
			});
		});
	});
}

function initDataset() {
	let year = 2015;
	let month = 8;
	let day = 1;
	let numDays = 100;
	let promises = [];

	console.log('Initializing dataset ...');
	for (let i = 0; i < numDays; i++) {
		let d = new Date(year, month, day + i);
		console.log(`\tFetching events for ${d} ...`)

		promises.push(queryEventsByDay(d).then(list => {
			list = list.map(p => (p.day = day, p));
			return Post.create(list).then(() => console.log(`\t... done ${d}`));
		}));
	}

	return Promise.all(promises).then(() => console.log('... done'));
};

function removeAll() {
	return Post.destroy({});
}

module.exports = function init(_Post, _Article) {
	const CLEAN_START = true;

	Post = _Post;
	Article = _Article;

	(CLEAN_START ? removeAll() : Promise.resolve())
		.then(Post.count())
		.then(num => { return (num > 0 ? Promise.resolve() : initDataset()) })
		.then(verifyAll);;
};

function verifyAll() {
	Post.find().then(list => {
		return new Promise((reject, resolve) => {
			let queue = list.map(p => (p.day = day, p));

			function step() {
				var item = queue.pop();
				if (!item) return resolve();

				console.log(`\tVerify \`${item.desc}\` ...`);
				verifyPost(item).then(() => {
					console.log(`\t... done.`);
				}).catch(err => {
					console.log(`\t... []error!`, err);
				});

				setTimeout(step, 30 * 1000)
			}

			step();
		});
	});
};

function categoryForTmpl(tmpl) {
	return categories.filter(function (c) {
		return c.tmpl.indexOf(tmpl) >= 0;
	})[0];
}

var categories = [
	{
		label: 'All Categories',
		tmpl: [],
		icon: 'magic'
	},
	{
		label: 'Awarded',
		tmpl: ['http://events.dbpedia.org/data/digests#AWARDED'],
		desc: ['%%labelres%% awarded with the %%award%%.'],
		icon: 'award'
	},
	{
		label: 'Change of Leader',
		tmpl: ['http://events.dbpedia.org/data/digests#LEADER'],
		desc: ['%%newLeader%% succeeds %%oldLeader%% as the leader of %%labelres%%.'],
		require: ['dbo:Person', 'dbo:Person'],
		icon: 'users'
	},
	{
		label: 'Deceased People',
		tmpl: ['http://events.dbpedia.org/data/digests#DEADPEOPLE', 'http://events.dbpedia.org/data/digests#DEADPEOPLEWOF'],
		desc: ['%%labelres%% died on %%deathdate%% in %%deathplace%%.', '%%labelres%% died on %%deathdate%% in %%deathplace%%.'],
		require: ['dbo:Person', '', 'dbo:Place'],
		icon: 'religious-christian'
	},
	{
		label: 'Released Things',
		tmpl: ['http://events.dbpedia.org/data/digests#RELEASED'],
		desc: ['%%labelres%% is released on %%releasedate%%.'],
		icon: 'plus'
	},
	{
		label: 'Introduced Things',
		tmpl: ['http://events.dbpedia.org/data/digests#INTRODUCED'],
		desc: ['%%labelres%% is introduced on %%introductionDate%%.'],
		icon: 'sun'
	},
	{
		label: 'Rising Numbers',
		tmpl: ['http://events.dbpedia.org/data/digests#RISINGNUMBERS'],
		desc: ['%%labelres%%\'s %%p%% raised from %%old%% to %%new%%.'],
		icon: 'chart-line'
	},
	{
		label: 'Headhunted',
		tmpl: ['http://events.dbpedia.org/data/digests#HEADHUNTED'],
		desc: ['%%labelres%% switches from %%oldTeam%% to %%newTeam%%.'],
		require: ['dbo:Person'],
		icon: 'user-plus'
	},
	{
		label: 'Change of President',
		tmpl: ['http://events.dbpedia.org/data/digests#PRESIDENT'],
		desc: ['%%newPres%% succeeds %%oldPres%% as the president of %%labelres%%.'],
		require: ['dbo:Person', 'dbo:Person'],
		icon: 'users'
	},
	{
		label: 'Europe 2015',
		tmpl: ['http://events.dbpedia.org/data/digests#EUROPE2015'],
		desc: ['Highlighted event for Europe in 2015 %%labelres%%.'],
		icon: 'euro'
	},
	{
		label: 'Winners Announced',
		tmpl: ['http://events.dbpedia.org/data/digests#GRANDPRIX', 'http://events.dbpedia.org/data/digests#PODIUM'],
		desc: ['%%firstD (%%firstT%%) wins %%labelres%%, %%secondD%% (%%secondT%%) got second, %%thirdD%% (%%thirdT%%) third.', 'Gold for %%gold%%, Silver for %%silver%%, Bronze for %%bronze%% in %%labelres%%.'],
		icon: 'award-1'
	},
	{
		label: 'Just Married',
		tmpl: ['http://events.dbpedia.org/data/digests#JUSTMARRIED'],
		desc: ['%%labelres%% married %%spouse%%.'],
		require: ['dbo:Person', 'dbo:Person'],
		icon: 'heart'
	},
	{
		label: 'Just Divorced',
		tmpl: ['http://events.dbpedia.org/data/digests#JUSTDIVORCED'],
		desc: ['%%labelres%% divorced %%spouse%%.'],
		require: ['dbo:Person', 'dbo:Person'],
		icon: 'heart-broken'
	},
	{
		label: 'Aircraft Occurence',
		tmpl: ['http://events.dbpedia.org/data/digests#AIRCRAFTOCCURRENCE'],
		desc: ['%%type%% with %%labelres%% from %%origin%% to %%destination%%.'],
		icon: 'paper-plane'
	},
	{
		label: 'Volcano Eruption',
		tmpl: ['http://events.dbpedia.org/data/digests#VOLCANO'],
		desc: ['Eruption of %%labelres%%.'],
		icon: 'fire'
	}
];
