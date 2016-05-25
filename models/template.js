module.exports = {
  identity: 'template',
  connection: 'templateDB',
  attributes: {
    name: {
      type: 'string',
      required : true
    },
    query: {
      type : 'string',
      required : true
    }
  }
}