var express = require('express'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    NotFoundError = require('../../app/errors/NotFoundError');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.param('id', function(req, res, next, id) {
    Payment.findById(id).populate('agent').exec(function (err, payment) {
      if (err) return next(err);
      if (!payment) return next(new NotFoundError('Payment not found'));

      req.payment = payment;
      next();
    });
  });

  router.get('/:id', ctrl.get);
  router.post('/', ctrl.create);
  router.put('/:id', ctrl.update);
  router.delete('/:id', ctrl.remove);

  app.use('/payments', router);
};
