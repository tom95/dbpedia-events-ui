Array.prototype.each = function(cb) { this.forEach(cb); return this; };
const fs = require('fs');
let data = JSON.parse(fs.readFileSync('posts.json'));

// the area around the month of the event we use to calculate the
// average of trends data
const TRENDS_MAX_DAY_VARIANCE = 6 * 32 * 24 * 60 * 60 * 1000;

// pre-process step in which filter out useless data and assign
// the `trendsConfirm` value
let processed = data
	.filter(post => post.status != 'unset')
	.each(post => {
		if (!(post.trends && post.trends.length))
			return;

		let start = post.day.$date - TRENDS_MAX_DAY_VARIANCE;
		let end = post.day.$date + TRENDS_MAX_DAY_VARIANCE;

		// count values we want to look at based on TRENDS_MAX_VARIANCE
		let counts = post.trends
			.map(t => (t.date = new Date(t.date), t))
			.filter(t => t.date >= start && t.date <= end);
		// the average over the counts we wanted to look at
		let avg = counts.reduce((sum, t) => sum + t.count, 0) / counts.length;

		// find the count of the event's month
		let eventDay = new Date(post.day.$date);
		let countInEventMonth = undefined;
		for (let i = 0; i < counts.length; i++) {
			if (counts[i].date.getMonth() == eventDay.getMonth() &&
				counts[i].date.getFullYear() == eventDay.getFullYear())
				countInEventMonth = counts[i].count;
		}

		// apply magic to determine whether the event was real
		post.trendConfirm = countInEventMonth < 2 * avg;
	});

// take only those events for which we had either trends data or articles
let dataAvailable = processed.filter(p => p.trends.length || p.numArticles > 0);

// take only events of a certain category
let correctEventsWithData = dataAvailable.filter(p => p.status == 'correct');
let belatedEventsWithData = dataAvailable.filter(p => p.status == 'belated');
let falseEventsWithData = dataAvailable.filter(p => p.status == 'false');
let garbageEventsWithData = dataAvailable.filter(p => p.status == 'garbage');
let illogicalEventsWithData = dataAvailable.filter(p => p.status == 'illogical');

let correctEvents = processed.filter(p => p.status == 'correct');
let belatedEvents = processed.filter(p => p.status == 'belated');
let falseEvents = processed.filter(p => p.status == 'false');
let garbageEvents = processed.filter(p => p.status == 'garbage');
let illogicalEvents = processed.filter(p => p.status == 'illogical');

console.log('Correctly identified:',
	correctEventsWithData.filter(p => p.trendConfirm || p.numArticles > 0).length,
	'of', correctEventsWithData.length);

console.log('Assumed belated event was correct:',
	belatedEventsWithData.filter(p => p.trendConfirm || p.numArticles > 0).length,
	'of', belatedEventsWithData.length);

console.log('Assumed false event was correct:',
	falseEventsWithData.filter(p => p.trendConfirm || p.numArticles > 0).length,
	'of', falseEventsWithData.length);

console.log('Assumed illogical event was correct:',
	illogicalEventsWithData.filter(p => p.trendConfirm || p.numArticles > 0).length,
	'of', illogicalEventsWithData.length);

console.log('Assumed garbage event was correct:',
	garbageEventsWithData.filter(p => p.trendConfirm || p.numArticles > 0).length,
	'of', garbageEventsWithData.length);

console.log('Correct Events:',
	correctEvents.length, 'of',  processed.length);

console.log('Belated Events:',
	belatedEvents.length, 'of',  processed.length);

console.log('False Events:',
	falseEvents.length, 'of',  processed.length);

console.log('Garbage Events:',
	garbageEvents.length, 'of',  processed.length);

console.log('Illogical Events:',
	illogicalEvents.length, 'of',  processed.length);
