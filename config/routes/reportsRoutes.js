var express = require('express');

module.exports = function(app, ctrl) {
  var router = express.Router();

  router.get('/unpaid-months', ctrl.unpaidMonths);
  router.get('/members-changes', ctrl.membersChanges);
  router.get('/payments-by-member', ctrl.paymentsByMember);
  router.get('/month-balance', ctrl.monthBalance);

  app.use('/reports', router);
};
