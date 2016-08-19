
module.exports = {
    identity: 'article',
    connection: 'templateDB',
	migrate: 'create',
    attributes: {
		title: 'string',
		url: 'string',
		excerpt: 'string',
		pubDate: 'date',
		imageUrl: 'string',
		source: 'string',
		post: { model: 'Post' }
    }
};

