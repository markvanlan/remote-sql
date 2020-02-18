module.exports = function(app) {
  const bodyParser = require("body-parser");
  let mysqlController = require("./mysql_controller.js");
  let postgresqlController = require("./postgresql_controller.js");

  let currentMysqlConnection = {
    host: "localhost",
    user: "root",
    password: ""
  };

  let currentPostgresConnection = {
    user: "",
    host: "localhost",
    database: "",
    password: "",
    port: 5432
  };

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  let updateCurrentMysqlConnection = function(data) {
    Object.assign(currentMysqlConnection, data);
    return currentMysqlConnection;
  };

  let updateCurrentPostgresConnection = function(data) {
    Object.assign(currentPostgresConnection, data);
    return currentPostgresConnection;
  };

  app.get("/", function(req, res) {
    let params = {
      type: (req.query.type || "mysql"),
      postgresError: (req.query.postgresError || 0),
      mysqlError: (req.query.mysqlError || 0)
    }
    res.render("index", params);
  });

  // POSTGRES ROUTES
  app.post("/postgresql", function(req, res) {
    postgresqlController.establishConnection(
      updateCurrentPostgresConnection(req.body),
      function(data, err) {
        if (err) {
          res.redirect("/?type=postgres&postgresError=1");
        }
        else {
          res.render("postgresql");
        }
      }
    );
  });

  app.get("/postgresql", function(req, res) {
    res.render("postgresql");
  });

  app.get("/postgresql-databases", function(req, res) {
    postgresqlController.getDatabases(function(data, err) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });

  app.get("/postgresql/:database", function(req, res) {
    postgresqlController.getTables(
      currentPostgresConnection,
      req.params.database,
      function(data, err) {
        if (err) res.send(err);
        else {
          res.render("postgresql_tables", {
            tables: data.sort(),
            database: req.params.database
          });
        }
      }
    );
  });

  app.post(
    "/postgresql/:database/table/:table/:offset/:count/:sortColumn/:sortType",
    function(req, res) {
      postgresqlController.getTableDetails(req.params.table, function(
        details,
        err1
      ) {
        if (err1) res.send(err1);
        else {
          postgresqlController.getTableData(
            req.params.table,
            req.params.offset,
            req.params.count,
            req.params.sortColumn,
            req.params.sortType,
            req.body,
            function(data, err2) {
              if (err2) res.send(err2);
              else {
                postgresqlController.getTableRowCount(
                  req.params.table,
                  function(count, err3) {
                    if (err3) res.send(err3);
                    else res.send([details, data, count]);
                  }
                );
              }
            }
          );
        }
      });
    }
  );

  app.post("/postgresql/:database/table/:table/row_update", function(req, res) {
    postgresqlController.updateRow(req.params.table, req.body, function(
      data,
      err
    ) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });

  app.post("/postgresql/:database/table/:table/delete_records", function(
    req,
    res
  ) {
    postgresqlController.deleteRecords(req.params.table, req.body, function(
      data,
      err
    ) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });

  // MYSQL ROUTES
  app.post("/mysql", function(req, res) {
    updateCurrentMysqlConnection(req.body);
    mysqlController.establishConnection(req.body, function(data, err) {
      if (err) res.send(err);
      else {
        // updateCurrentMysqlConnection(data)
        res.render("mysql");
      }
    });
  });

  app.get("/mysql", function(req, res) {
    res.render("mysql", { connection: currentMysqlConnection });
  });

  app.get("/mysql-databases", function(req, res) {
    mysqlController.getDatabases(currentMysqlConnection, function(data, err) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });

  app.get("/mysql/:database", function(req, res) {
    mysqlController.getTables(
      currentMysqlConnection,
      req.params.database,
      function(data, err) {
        if (err) res.send(err);
        else {
          res.render("mysql_tables", {
            tables: data.sort(),
            database: req.params.database
          });
        }
      }
    );
  });

  app.post(
    "/mysql/:database/table/:table/:offset/:count/:sortColumn/:sortType",
    function(req, res) {
      mysqlController.getTableDetails(req.params.table, function(
        details,
        err1
      ) {
        if (err1) res.send(err1);
        else {
          mysqlController.getTableData(
            req.params.table,
            req.params.offset,
            req.params.count,
            req.params.sortColumn,
            req.params.sortType,
            req.body,
            function(data, err2) {
              if (err2) res.send(err2);
              else {
                mysqlController.getTableRowCount(req.params.table, function(
                  count,
                  err3
                ) {
                  if (err3) res.send(err3);
                  else res.send([details, data, count]);
                });
              }
            }
          );
        }
      });
    }
  );

  app.post("/mysql/:database/table/:table/row_update", function(req, res) {
    mysqlController.updateRow(req.params.table, req.body, function(data, err) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });

  app.post("/mysql/:database/table/:table/delete_records", function(req, res) {
    mysqlController.deleteRecords(req.params.table, req.body, function(
      data,
      err
    ) {
      if (err) res.send(err);
      else {
        res.send(data);
      }
    });
  });
};
