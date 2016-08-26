
module.exports = {
    identity: 'marticle',
    connection: 'mongo',
	migrate: 'create',
    attributes: {
		title: 'string',
		url: 'string',
		excerpt: 'string',
		pubDate: 'date',
		imageUrl: 'string',
		source: 'string',
		post: { model: 'mpost' }
    }
};

