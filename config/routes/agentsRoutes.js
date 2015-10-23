var express = require('express'),
    mongoose = require('mongoose'),
    Agent = mongoose.model('Agent'),
    NotFoundError = require('../../app/errors/NotFoundError');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.param('id', function(req, res, next, id) {
    Agent.findById(req.params.id, function (err, agent) {
      if (err) return next(err);
      if (!agent) return next(new NotFoundError('Agent not found'));
      req.agent = agent;
      next();
    });
  });

  router.get('/', ctrl.list);
  router.get('/:id', ctrl.get);
  router.post('/', ctrl.create);
  router.put('/:id', ctrl.update);
  router.delete('/:id', ctrl.remove);

  app.use('/agents', router);
};
