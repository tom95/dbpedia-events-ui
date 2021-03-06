module.exports = [{
    // return all template items
    path: '/template',
    method: 'GET',
    config: {
        handler: function (request, reply) {

            var Template = request.collections.template;

            // Reply with promise
            reply(Template.find());
        }
    }
}, {
    // return a specific template by id
    path: '/template/{name}',
    method: 'GET',
    config: {
        handler: function (request, reply) {

            var Template = request.collections.template;

            reply(Template.findOne({'name': request.params.name})).exec(function (err, template) {
                if (err)
                    console.log(err);
                console.log("get: ", template)
            });
        }
    }
}, {
    // create a new template
    path: '/template',
    method: 'POST',
    config: {
        handler: function (request, reply) {

            var Template = request.collections.template;

            reply(Template.create({
                    'name': request.payload.name,
                    'query': request.payload.query
                }).exec(function (err, template) {
                    if (err)
                        console.log(err);
                    console.log("saved: ", template)
                })
            );
        }
    }
}, {
    // udpate an existing template by name
    path: '/template/{name}',
    method: ['PATCH', 'POST'],
    config: {
        handler: function (request, reply) {

            var Template = request.collections.template;

            reply(Template.update({name: request.params.name}, {query: request.payload.query}));
        }
    }
}, {
    // remove a template by name
    path: '/template/{name}',
    method: 'DELETE',
    config: {
        handler: function (request, reply) {

            var Template = request.collections.template;

            reply(Template.destroy({name: request.params.name}).exec(function (err, template) {
                    if (err)
                        console.log(err);
                    console.log("deleted: ", template)
                })
            );
        }
    }
}
];
