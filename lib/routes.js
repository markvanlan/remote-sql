module.exports = function(app){
  const bodyParser = require('body-parser');
  let mysqlController = require("./mysql.js");
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  let currentConnection = {
    host: "localhost",
    user: "root",
    password: ""
  };
  let updateCurrentConnection = function(data) {
    currentConnection.host = data.host
    currentConnection.user = data.user
    currentConnection.password = data.password
  }

  app.get('/', function (req, res) {
    res.render('index')
  })

  app.post('/mysql', function(req, res) {
    mysqlController.testMysqlConnection(req.body.host, req.body.user, req.body.password, function(data,err){
      if (err)
        res.send(err)
      else {
        updateCurrentConnection(data)
        res.render('mysql', {connection: currentConnection})
      }      
    })        
  })

  app.get('/mysql', function(req, res) {
    res.render('mysql', {connection: currentConnection})
  })
  
  app.get('/mysql-databases', function(req, res) {
    mysqlController.getDatabases(currentConnection,function(data,err) {
      if (err)
        res.send(err)  
      else {
        res.send(data)
      }
    })    
  })

  app.get('/mysql/:database', function(req, res) {
    mysqlController.getTables(currentConnection,req.params.database, function(data, err){
      if (err)
        res.send(err)  
      else {
        res.render('mysql_tables', {tables: data})
      }
    })
  })

  app.get('/mysql/:database/table/:table', function(req, res) {
    mysqlController.getTableDetails(currentConnection,req.params.database, req.params.table ,function(details, err1){
      if (err1)
        res.send(err1)  
      else {
        mysqlController.getTableData(currentConnection,req.params.database, req.params.table ,function(data, err2){
        if (err2)
          res.send(err2)  
        else {
          res.send([details,data])
        }
      })
      }
    })
  })

}
