const { Pool, Client } = require('pg')
let pool;

module.exports = {
  getDatabases: function(callback) {
    pool.connect((err, client, done) => {
      if (err) throw err
      client.query('select datname from pg_database', (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          console.log(res.rows)
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
      if (err) throw err
      client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'", (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          console.log(res.rows)
          callback(res.rows)
        }
      })
    })
  },

  getTableDetails: function(table, callback) {
    pool.connect((err, client, done) => {
      if (err) throw err
      let query = "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = " + "'" + table + "'"
      client.query(query, (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          console.log("RESULTSSnfjksdngkdfjngkdf", res.rows)
          callback(res.rows)
        }
      })
    })
  },

  getTableData: function(table, callback) {
    pool.connect((err, client, done) => {
      if (err) throw err
      let query = "SELECT * FROM "+ table
      client.query(query, (err, res) => {
        done()
        if (err) {
          console.log(err.stack)
          callback(null,err)
        } else {
          console.log(res.rows)
          callback(res.rows)
        }
      })
    })
  }
};