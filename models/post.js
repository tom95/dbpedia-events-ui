
module.exports = {
    identity: 'post',
    connection: 'templateDB',
    attributes: {
		digestid: 'string',
		tmpl: 'string',
		day: 'date',
		desc: 'string',
		res: 'string',
		trends: 'string',
		numArticles: 'integer',
		articles: 'string'
    }
};

