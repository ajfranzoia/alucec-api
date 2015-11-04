var express = require('express'),
    glob = require('glob'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compress = require('compression'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    cors = require('cors'),
    mongoose = require('mongoose'),
    passportErrors = require('passport-local-mongoose/lib/errors'),
    AppError = require('./errors/AppError'),
    NotFoundError = require('./errors/NotFoundError');

/**
 * ALUCEC app initialization.
 *
 * @exports models/App
 * @type {Function}
 */
module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';

  // Connect to database
  mongoose.connect(config.db);
  mongoose.connection.on('error', function () {
    throw new Error('Unable to connect to database at ' + config.db);
  });

  // Load models
  var models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(function (model) {
    require(model);
  });

  // Set views
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'ejs');

  // Load middlewares
  app.use(cors());
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());
  app.use(session({
    secret: '18307548503685761054756347',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup auth
  require(config.root + '/config/auth')(app, config);

  // Load routes
  require(config.root + '/config/routes')(app, config);

  // Not found handler
  app.use(function (req, res, next) {
    var err = new NotFoundError('Not Found');
    next(err);
  });

  // Load error handler
  app.use(AppErrorHandler);

  return app;
};

function AppErrorHandler(err, req, res, next) {
  var errorData;

  if (err.name === 'ValidationError') {
    errorData = {
      name: err.name,
      message: err.message,
      errors: err.errors || []
    };
  }

  if (err.name === 'CastError') {
    errorData = {
      name: err.name,
      message: 'Not found',
      status: 404,
    };
  }

  if (err instanceof AppError ||
      err instanceof passportErrors.AuthenticationError) {
    errorData = {
      name: err.name,
      message: err.message,
    };
  }

  //console.log(err.stack);

  if (errorData) {
    res.status(errorData.status || err.status || 400);
    res.send(errorData);
  } else {
    // Unrecognized error
    res.status(err.status || 500);
    res.send({
      name: err.name,
      message: err.message
    });
  }
}
