var loki = require('lokijs')
var db = new loki('database',
  {
    autosave: true,
    autosaveInterval: 1000,
    autoload: true
  })

var database = {}

database.login = (query) => {
  console.log(query)
  return query
//   res.json(query)
}

database.reg = (query) => {
    
}

module.exports = database
