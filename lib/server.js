#!/usr/bin/env node

const express = require('express');
var path = require("path");
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const storage = require('node-persist');

const PORT = process.argv[2] || 8080;
const HOST = '0.0.0.0';
const app = express();
require('./routes')(app);

app.set('views', path.join(__dirname, '../views')); 
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, '../assets')))

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
