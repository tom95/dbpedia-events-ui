
module.exports = {
    identity: 'article',
    connection: 'mongoDB',
    attributes: {
		id: { type: 'integer', autoIncrement: true, primaryKey: true, unique: true },
		title: { type: 'string', defaultsTo: '' },
		url: { type: 'string', defaultsTo: '' },
		excerpt: { type: 'string', defaultsTo: '' },
		author: { type: 'string', defaultsTo: '' },
		imageUrl: { type: 'string', defaultsTo: '' },
		pubDate: { type: 'date', defaultsTo: '' },
		post: { model: 'post' }
    }
};

