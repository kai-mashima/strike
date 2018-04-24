'use strict';
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname + '/../dist'));

app.get('*', (request, response) => {
    response.sendFile(path.join(__dirname, '/../dist', 'index.html'))
});

module.exports = app;