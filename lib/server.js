#!/usr/bin/env node

const express = require("express");
var path = require("path");
const { body, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const session = require("express-session");

const cookieSession = require('cookie-session')

const PORT = process.argv[2] || 8080;
const HOST = "0.0.0.0";
const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "../assets")));
app.use(express.static(path.join(__dirname, "../node_modules/jquery/dist")));

app.set("trust proxy", 1); // trust first proxy
app.use(cookieSession({
  name: 'session',
  keys: ["postgresCredentials", "mysqlCredentials"],
  maxAge: 24 * 60 * 60 * 1000  * 365 // 24 hours
}))

require("./routes")(app);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
