var ReportsService = require('../services/ReportsService');

/**
 * Reports actions.
 *
 * @type {Object}
 */
var ReportsController = {

  /**
   * Unpaid months report.
   * Calls ReportsService.unpaidMonths()
   */
  unpaidMonths: function (req, res, next) {
    ReportsService.unpaidMonths(req.query, function(err, results) {
      if (err) return next(err);
      res.send(results);
    });
  },

  /**
   * Member changes in a specified month report.
   * Calls ReportsService.membersChanges()
   */
  membersChanges: function (req, res, next) {
    ReportsService.membersChanges(req.query, function(err, results) {
      if (err) return next(err);
      res.send(results);
    });
  },

  /**
   * Month balance report.
   * Calls ReportsService.monthBalance()
   */
  periodBalance: function (req, res, next) {
    ReportsService.periodBalance(req.query, function(err, results) {
      if (err) return next(err);
      res.send(results);
    });
  },

  /**
   * Payments by member in a specified period report.
   * Calls ReportsService.paymentsByMember()
   */
  paymentsByMember: function (req, res, next) {
    ReportsService.paymentsByMember(req.query, function(err, results) {
      if (err) return next(err);
      res.send(results);
    });
  },

}

module.exports = ReportsController;
