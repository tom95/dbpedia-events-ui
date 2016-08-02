
module.exports = {
    identity: 'article',
    connection: 'templateDB',
    attributes: {
		title: 'string',
		url: 'string',
		excerpt: 'string',
		author: 'string',
		imageUrl: 'string',
		pubDate: 'date',
		post: { model: 'post' }
    }
};

