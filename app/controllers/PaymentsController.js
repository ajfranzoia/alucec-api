var PaymentsService = require('../services/PaymentsService');

/**
 * Payments actions.
 *
 * @type {Object}
 */
var PaymentsController = {

  /**
   * Get payment by 'id' param.
   */
  get: function (req, res, next) {
    res.send(req.payment);
  },

  /**
   * Add new payment.
   * Calls PaymentsService.pay()
   */
  create: function (req, res, next) {
    PaymentsService.pay(req.body, function (err, payment) {
      if (err) return next(err);
      res.send(payment);
    });
  },

  /**
   * Update existing payment.
   * Calls PaymentsService.update()
   */
  update: function (req, res, next) {
    PaymentsService.update(req.payment, req.body, function (err, payment) {
      if (err) return next(err);
      res.send(payment);
    });
  },

  /**
   * Removes existing payment.
   * Calls PaymentsService.unpay()
   */
  remove: function(req, res, next) {
    PaymentsService.unpay(req.payment._id, function(err, payment) {
      if (err) return next(err);
      res.send(payment);
    });
  }

};

module.exports = PaymentsController;
