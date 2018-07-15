module.exports = function(app){
  const bodyParser = require('body-parser');
  let mysqlController = require("./mysql_controller.js");
  let postgresController = require("./postgres_controller.js");

  let currentMysqlConnection = {
    host: "localhost",
    user: "root",
    password: ""
  };

  let currentPostgresConnection = {
    user: 'Mark',
    host: 'localhost',
    database: '',
    password: '',
    port: 5432,
  };
  
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  let updateCurrentMysqlConnection = function(data) {
    currentMysqlConnection.host = data.host
    currentMysqlConnection.user = data.user
    currentMysqlConnection.password = data.password
  }

  let updateCurrentPostgresConnection = function(data) {
    currentPostgresConnection.host = data.host
    currentPostgresConnection.user = data.user
    currentPostgresConnection.password = data.password
    currentPostgresConnection.database = data.database
    currentPostgresConnection.port = data.port
  }

  app.get('/', function (req, res) {
    res.render('index')
  })



  // POSTGRES ROUTES
  app.post('/postgres', function(req, res) {
    postgresController.establishConnection(req.body, function(data,err){
      if (err)
        res.send(err)
      else {
        updateCurrentPostgresConnection(data)
        res.render('postgres')
      }      
    })        
  })

  app.get('/postgres', function(req, res) {
    res.render('postgres')
  })

  app.get('/postgres-databases', function(req, res) {
    postgresController.getDatabases(function(data,err) {
      if (err)
        res.send(err)  
      else {
        res.send(data)
      }
    })    
  })

  app.get('/postgres/:database', function(req, res) {
    postgresController.getTables(currentPostgresConnection, req.params.database, function(data, err){
      if (err)
        res.send(err)  
      else {
        res.render('postgres_tables', {tables: data})
      }
    })
  })

  app.get('/postgres/:database/table/:table', function(req, res) {
    postgresController.getTableDetails(req.params.table ,function(details, err1){
      if (err1)
        res.send(err1)  
      else {
        postgresController.getTableData(req.params.table ,function(data, err2){
        if (err2)
          res.send(err2)  
        else {
          res.send([details,data])
        }
      })
      }
    })
  })


  // MYSQL ROUTES
  app.post('/mysql', function(req, res) {
    updateCurrentMysqlConnection(req.body)
    mysqlController.establishConnection(req.body, function(data,err){
      if (err)
        res.send(err)
      else {
        // updateCurrentMysqlConnection(data)
        res.render('mysql')
      }      
    })        
  })

  app.get('/mysql', function(req, res) {
    res.render('mysql', {connection: currentMysqlConnection})
  })
  
  app.get('/mysql-databases', function(req, res) {
    mysqlController.getDatabases(currentMysqlConnection,function(data,err) {
      if (err)
        res.send(err)  
      else {
        res.send(data)
      }
    })    
  })

  app.get('/mysql/:database', function(req, res) {
    mysqlController.getTables(currentMysqlConnection,req.params.database, function(data, err){
      if (err)
        res.send(err)  
      else {
        res.render('mysql_tables', {tables: data, database: req.params.database})
      }
    })
  })

  app.get('/mysql/:database/table/:table/:offset/:count', function(req, res) {
    mysqlController.getTableDetails(req.params.table ,function(details, err1){
      if (err1)
        res.send(err1)  
      else {
        mysqlController.getTableData(req.params.table, req.params.offset, req.params.count ,function(data, err2){
          if (err2)
            res.send(err2)  
          else {
            mysqlController.getTableRowCount(req.params.table, function(count, err3){
              if (err3)
                res.send(err3)
              else
                res.send([details,data,count])
            })          
          }
        })
      }
    })
  })

  app.post('/mysql/:database/table/:table/row_update', function(req, res) {
    mysqlController.updateRow(req.params.table, req.body, function(data, err){
      if (err)
        res.send(err)  
      else {
        res.send(data)
      }
    })
  })

}
