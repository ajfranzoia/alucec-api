var express = require('express');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.get('/unpaid-months', ctrl.unpaidMonths);
  router.get('/members-changes', ctrl.membersChanges);
  router.get('/period-balance', ctrl.periodBalance);
  router.get('/payments-by-member', ctrl.paymentsByMember);

  app.use('/reports', router);
};
