'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.set('view engine', 'pug')
app.use(express.static('assets'))

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!' })
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

var mysql = require('mysql');
var con;

var connectToDatabase = function() {
	con = mysql.createConnection({
	  host: "localhost",
	  user: "mark",
	  password: ""
	});
	con.connect(function(err) {
  	if (err) throw err;
	  console.log("Connected!");
	});
} 


