let mysql = require('mysql');
let con;

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
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      connection.query('SHOW DATABASES', function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
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
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      connection.query('SHOW TABLES', function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        let tables = result.map(function(row){
          return row[Object.keys(row)[0]];
        })
        callback(tables)
      });
    });
  },
  
  getTableDetails: function(table, callback) {
    pool.getConnection(function(err, connection) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      connection.query("DESCRIBE " + table, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        let columns = result.map(function(res){
          return res["Field"];
        })
        callback(columns)
      });
    });
  },

  getTableRowCount: function(table, callback) {
    pool.getConnection(function(err, connection) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      query = ("SELECT COUNT(*) FROM " + table)
      connection.query(query, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        callback(result[0]["COUNT(*)"])
      });
    });
  },  

  getTableData: function(table, offset, count, sortColumn, sortType, customQuery, callback) {
    pool.getConnection(function(err, connection) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      let query = ""
      if (Object.keys(customQuery).length != 0)
        query = customQuery.query // This is called and limits are avoided if customQuery is passed in
      else {
        offset = offset - 1
        query = ("SELECT * FROM " + table)
        if (sortColumn != "NONE" && sortType != "NONE")
          query = query + (" ORDER BY "+sortColumn+" "+sortType)
        query = query + " LIMIT " + offset + "," + count
      }
      
      console.log(query)
      connection.query(query, function (error, result, fields) {
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        callback(result)
      });
    });
  },

  updateRow: function(table, values, callback) {
      // Get the updated values
    let newVals = values.newValues
    for (key in newVals) {
      if(values.originalValues[key] == newVals[key])
        delete newVals[key]
    }
    if (Object.keys(newVals).length == 0)
      return callback(true)
    pool.getConnection(function(err, connection) {
      let primaryKey;
      // Check to see if you table has a primary key
      connection.query("SHOW KEYS FROM "+ table+ " WHERE Key_name = 'PRIMARY'", function (error, result, fields) {
        // When done with the connection, release it.        
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        // If there is a primary key, lets update!!
        if (result[0])
          primaryKey = result[0].Column_name
        else primaryKey = null;

        let query;
        let set = "";
        if (primaryKey != null) {
          for(let key in newVals){
            set = set + key + " = '" + newVals[key]
            let lastKey = Object.keys(newVals)[Object.keys(newVals).length-1]
            if (key != lastKey)
              set = set + "', "
            else
              set = set + "'"
          }
          query = "UPDATE "+table+" SET "+set+" WHERE "+primaryKey+" = "+values.originalValues[primaryKey];
          console.log(query)
          connection.query(query, function (error, results, fields) {
            connection.release();
            if (error){
              console.log(error)
              return callback(null, error);
            } 
            callback(results)
          })
        }
        // If there is no primary key
        else {
          
          for(let key in newVals){
            // Set the Set portion
            set = set + key + " = '" + newVals[key]
            let lastKey = Object.keys(newVals)[Object.keys(newVals).length-1]
            if (key != lastKey)
              set = set + "', "
            else
              set = set + "'"            
          }

          // Set the where clause
          let where = "";
          for(let key in values.originalValues) {
            where = where + key + " = '" + values.originalValues[key]
            let lastKey = Object.keys(values.originalValues)[Object.keys(values.originalValues).length-1]
            if (key != lastKey)
              where = where + "' AND "
            else
              where = where + "'"          
          }
          
          query = "UPDATE "+table+" SET "+set+" WHERE "+where
          console.log(query)
          connection.query(query, function (error, results, fields) {
            connection.release();
            if (error){
              console.log(error)
              return callback(null, error);
            } 
            callback(results)
          })
        }
      });      
    });
  },

  deleteRecords: function(table, params, callback) {
    pool.getConnection(function(err, connection) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      query = "DELETE FROM " + table + " WHERE id IN (" + params.ids.join(',') + ")"
      console.log(query)
      connection.query(query, function (error, result, fields) {        
        // When done with the connection, release it.        
        connection.release();
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        callback(result)
      });
    });
  }
};