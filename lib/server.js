'use strict';

const express = require('express');
// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// App
const app = express();
require('./routes')(app);

app.set('view engine', 'pug')
app.use(express.static('assets'))

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
