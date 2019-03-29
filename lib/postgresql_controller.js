const { Pool, Client } = require('pg')
let pool;

module.exports = {
  getDatabases: function(callback) {
    pool.connect((err, client, done) => {
      if (err) {
        console.log(err)
        callback(null, err)
      }
      client.query('select datname from pg_database', (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          callback(res.rows)
        }
      })
    })
  },

  establishConnection: function(details, callback) {
    pool = new Pool({
      user: details.user,
      host: details.host,
      database: details.database ? details.database : 'postgres',
      password: details.password,
      port: details.port,
    })

    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
      callback(null, err)
    })
    callback(true)
  },

  getTables: function(connectionDetails, db, callback) {
    pool = new Pool({
      user: connectionDetails.user,
      host: connectionDetails.host,
      database: db,
      password: connectionDetails.password,
      port: connectionDetails.port,
    })
    
    pool.connect((err, client, done) => {
      if (err) {
        console.log(err)
        callback(null, err)
      }
      client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'", (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          let tables = res.rows.map(function(row){
            return row[Object.keys(row)[0]];
          })
          callback(tables)
        }
      })
    })
  },

  getTableDetails: function(table, callback) {
    pool.connect((err, client, done) => {
      if (err) {
        console.log(err)
        callback(null, err)
      }
      let query = ("select column_name,data_type from information_schema.columns where table_name = '"+table+"'")
      client.query(query, (err, res, fields) => {
        done()
        if (err) {
          callback(null,err)
        } else {
          let columns = res.rows.map(function(row){
            return row["column_name"];
          })
          callback(columns)
        }
      })
    })
  },

  getTableRowCount: function(table, callback) {
    pool.connect(function(err, connection, done) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      query = ("SELECT COUNT(*) FROM " + table)
      connection.query(query, function (error, result, fields) {
        // When done with the connection, release it.        
        done()
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        callback(result.rows[0].count)
      });
    });
  },

  getTableData: function(table, offset, count, sortColumn, sortType, customQuery, callback) {
    pool.connect((err, client, done) => {
      if (err) {
        console.log(err)
        callback(null, err)
      }
      let query = ""
      if (Object.keys(customQuery).length != 0)
        query = customQuery.query // This is called and limits are avoided if customQuery is passed in
      else {
        offset = offset - 1
        query = ("SELECT * FROM " + table)
        if (sortColumn != "NONE" && sortType != "NONE")
          query = query + (" ORDER BY "+sortColumn+" "+sortType)
        query = query + " LIMIT "+count+ " OFFSET "+offset
      }
      console.log(query)
      client.query(query, (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          callback(res.rows)
        }
      })
    })
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
    pool.connect(function(err, connection, done) {
      let primaryKey;
      // Check to see if you table has a primary key
      connection.query("SELECT pg_attribute.attname, format_type(pg_attribute.atttypid, pg_attribute.atttypmod) FROM pg_index, pg_class, pg_attribute, pg_namespace WHERE pg_class.oid = '"+table+"'::regclass AND indrelid = pg_class.oid AND nspname = 'public' AND pg_class.relnamespace = pg_namespace.oid AND pg_attribute.attrelid = pg_class.oid AND pg_attribute.attnum = any(pg_index.indkey) AND indisprimary", function (error, result, fields) {
        // When done with the connection, release it.        
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        // If there is a primary key, lets update!!        
        if (result.rows[0].attname)
          primaryKey = result.rows[0].attname
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
          connection.query(query, (err, res, fields) => {
            done()
            if (err) {
              console.log(err.stack)
              callback(null,err)
            } else {
              callback(res.rows)
            }
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
          client.query(query, (err, res, fields) => {
            done()
            if (err) {
              console.log(err.stack)
              callback(null,err)
            } else {
              callback(res.rows)
            }
          })
        }
      });      
    });
  },

  deleteRecords: function(table, params, callback) {
    pool.connect(function(err, connection, done) {
      if (err){
        console.log(err)
        return callback(null, err);
      } 
      query = "DELETE FROM " + table + " WHERE id IN (" + params.ids.join(',') + ")"
      console.log(query)
      connection.query(query, function (error, result, fields) {        
        // When done with the connection, release it.        
        done()
        if (error){
          console.log(error)
          return callback(null, error);
        } 
        callback(result)
      });
    });
  }

};



      