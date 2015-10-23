var express = require('express');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.get('/', ctrl.get);
  router.put('/', ctrl.update);

  app.use('/config', router);
};
