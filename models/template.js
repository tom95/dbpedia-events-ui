module.exports = {
    identity: 'template',
    connection: 'mongoDB',
    attributes: {
        name: {
            type: 'string',
            required: true,
            unique: true
        },
        query: {
            type: 'json',
            required: true
        }
    }
};
