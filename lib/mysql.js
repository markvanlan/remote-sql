let mysql = require('mysql');
let con;

let connect = function(details) {
  return (
    mysql.createConnection({
      host: details.host,
      user: details.user,
      password: details.password,
    })
  )
}

let connectToDb = function(details, db) {
  return (
    mysql.createConnection({
      host: details.host,
      user: details.user,
      password: details.password,
      database: db
    })
  )
}

module.exports = {
  testMysqlConnection: function(host, user, password, callback) {
    let data = {
      host: host,
      user: user,
      password: password
    }
    con = mysql.createConnection(data);
    con.connect(function(err) {
      if (err) throw callback(null,err);
      else callback(data)
    });
  },

  getDatabases: function(connection, callback) {
    con = connect(connection)
    con.connect(function(err) {
      if (err) throw err;
      con.query("SHOW DATABASES", function (err, result, fields) {
        if (err) 
          return(callback(null,err))
        else {
          let dbs = result.map(function(row){
            return row.Database
          })
          return(callback(dbs))
        }
      });
    });
  },

  getTables: function(connection, db, callback) {
    con = connectToDb(connection,db)
    con.connect(function(err) {
      if (err) throw err;
      con.query("SHOW TABLES", function (err, result, fields) {
        if (err) 
          return(callback(null,err))
        else {
          let tables = result.map(function(row){
            return row[Object.keys(row)[0]];;
          })
          return(callback(tables))
        }
      });
    });
  },

  getTableDetails: function(connection, db, table, callback) {
    con = connectToDb(connection,db)
    con.connect(function(err) {
      if (err) throw err;
      query = ("DESCRIBE " + table)
      con.query(query, function (err, result, fields) {
        if (err) 
          return(callback(null,err))
        else {          
          return(callback(result))
        }
      });
    });
  },

  getTableData: function(connection, db, table, callback) {
    con = connectToDb(connection,db)
    con.connect(function(err) {
      if (err) throw err;
      query = ("SELECT * FROM " + table)
      con.query(query, function (err, result, fields) {
        if (err) 
          return(callback(null,err))
        else {          
          return(callback(result))
        }
      });
    });
  },
};