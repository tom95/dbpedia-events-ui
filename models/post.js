
module.exports = {
    identity: 'post',
    connection: 'mongoDB',
    attributes: {
		id: { type: 'integer', autoIncrement: true, primaryKey: true, unique: true },
		digestid: 'string',
		tmpl: 'string',
		day: 'date',
		desc: 'string',
		res: 'string',
		trends: 'json',
		numArticles: 'integer',
		articles: { collection: 'article', via: 'post' },

		verified: { defaultsTo: false, type: 'boolean' },
		userConfirm: { defaultsTo: false, type: 'boolean' },
		userChecked: { defaultsTo: false, type: 'boolean' },
		garbage: { defaultsTo: false, type: 'boolean' },
    }
};

