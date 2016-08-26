
module.exports = {
    identity: 'mpost',
    connection: 'mongo',
	migrate: 'create',
    attributes: {
		digestid: 'string',
		tmpl: 'string',
		day: 'date',
		desc: 'string',
		endTime: 'string',
		res: 'string',
		trends: 'json',
		numArticles: 'integer',
		articles: { collection: 'marticle', via: 'post' },

		verified: { defaultsTo: false, type: 'boolean' },
		processed: { defaultsTo: false, type: 'boolean' },
		status: {
			defaultsTo: 'unset',
			type: 'string',
			enum: ['unset', 'correct', 'garbage', 'belated', 'illogical', 'false']
		}
    }
};

