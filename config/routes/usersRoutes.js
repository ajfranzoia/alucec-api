var express = require('express');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.post('/register', ctrl.register);
  router.post('/login', ctrl.login);

  app.use('/users', router);
};
