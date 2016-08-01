
module.exports = {
    identity: 'post',
    connection: 'templateDB',
    attributes: {
		digestid: 'string',
		tmpl: 'string',
		day: 'date',
		desc: 'string',
		res: 'string',
		trends: 'json',
		numArticles: 'integer',
		articles: { collection: 'Article', via: 'post' },

		verified: { defaultsTo: false, type: 'boolean' },
		userConfirm: { defaultsTo: false, type: 'boolean' },
		userChecked: { defaultsTo: false, type: 'boolean' },
		garbage: { defaultsTo: false, type: 'boolean' },
    }
};

