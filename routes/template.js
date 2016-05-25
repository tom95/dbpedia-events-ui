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

          // Reply with promise
          reply(Template.findOne({'name': request.params.name}));
      }
  }
}, {
  // create a new template
  path: '/template',
  method: 'POST',
  config: {
      handler: function (request, reply) {

          var Template = request.collections.template;

          console.log(request.payload);

          // Reply with promise
          reply(Template.create({'name': request.payload.name}, {'query': request.payload.query}));
      }
  }
}, {
  // udpate an existing template by name
  path: '/template/{name}',
  method: ['PATCH', 'POST'],
  config: {
      handler: function (request, reply) {

          var Template = request.collections.template;

          // Reply with promise
          reply(Template.find());
      }
  }
}, {
  // remove a template by name
  path: '/template/{name}',
  method: 'DELETE',
  config: {
      handler: function (request, reply) {

          var Template = request.collections.template;

          // Reply with promise
          reply(Template.find());
      }
  }
}
];
