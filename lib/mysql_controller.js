let mysql = require('mysql');
let con;

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

let pool  = mysql.createPool({
  connectionLimit : 10,
  host            : 'example.org',
  user            : 'bob',
  password        : 'secret',
  database        : 'my_db'
});


module.exports = {
  establishConnection: function(details, callback) {
    pool  = mysql.createPool({
      connectionLimit : 10,
      host            : details.host,
      user            : details.user,
      password        : details.password,
      database        : details.database
    });
    callback(true)
  },

  getDatabases: function(connection, callback) {
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query('SHOW DATABASES', function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error) throw error;
        let dbs = result.map(function(row){
          return row.Database
        })
        callback(dbs)
      });
    });
  },

  getTables: function(connection, db, callback) {
    pool  = mysql.createPool({
      connectionLimit : 10,
      host            : connection.host,
      user            : connection.user,
      password        : connection.password,
      database        : db
    });
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query('SHOW TABLES', function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error) throw error;
        let tables = result.map(function(row){
          return row[Object.keys(row)[0]];;
        })
        callback(tables)
      });
    });
  },
  getTableDetails: function(table, callback) {
    
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      connection.query("DESCRIBE " + table, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error) throw error;
        callback(result)
      });
    });
  },

  getTableRowCount: function(table, callback) {
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      query = ("SELECT COUNT(*) FROM " + table)
      connection.query(query, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error) throw error;
        callback(result)
      });
    });
  },  

  getTableData: function(table, offset, count, callback) {
    pool.getConnection(function(err, connection) {
      if (err) throw err;
      offset = offset - 1
      query = ("SELECT * FROM " + table + " LIMIT " + offset + "," + count)
      connection.query(query, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error) throw error;
        callback(result)
      });
    });
  },
};