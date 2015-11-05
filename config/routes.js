var passport = require('passport'),
    path = require('path'),
    S = require('string');

module.exports = function(app, config) {

  app.get('/', function(req, res, next) {
    res.send('ok');
  });

  // Users routes not secured by default
  loadRoutes('users');

  // Simple authorization scheme: secure routes below
  var requireUser = passport.authenticate('jwt', {session: false});
  //app.use(requireUser);

  // Secured routes
  loadRoutes('agents');
  loadRoutes('config');
  loadRoutes('payments');
  loadRoutes('members');
  loadRoutes('reports');

  function loadRoutes(name) {
    var ctrl = loadController(S(name).capitalize());
    return require('./routes/' + name + 'Routes.js')(app, ctrl);
  }

  function loadController(name) {
    return require(path.join(config.paths.controllers, name + 'Controller'));
  }
};
