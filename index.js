'use strict';
var express = require('express');
var path = require("path");
var sockets = require('./sockets');
var config = require('getconfig');

/* Start Dev Server */
var app     = express();
var server = app.listen(process.env.PORT || 8000);
sockets(server, config);
console.log(process.env.PORT);
// Serve static assets
app.use(express.static(path.resolve(__dirname, '.', 'dist')));

// Always return the main index.html, so react-router render the route in the client
app.get('/page', (req, res) => {
  res.sendFile(path.resolve(__dirname, '.', 'dist', 'index.html'));
});

// /^((?!\/api).)*$/
//app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // var err = new Error('Not Found');
  // err.status = 404;
  //next(err);
  res.status(404).send('Not found');
});

// app.listen(app.get('port'), function() {
//   console.log("Node app is running at localhost:" + app.get('port'));
// });
