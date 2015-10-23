var express = require('express'),
    glob = require('glob'),
    config = require('./config/config'),
    initializeApp = require('./app/app');

var app = express();
initializeApp(app, config);

var server = app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

module.exports = server;
