var _ = require('lodash'),
    moment = require('moment'),
    mongoose = require('mongoose'),
    Member = require('../models/Member'),
    Agent = require('../models/Agent'),
    Payment = require('../models/Payment'),
    async = require('async');

/**
 * Generates ALUCEC reports data.
 *
 * @exports services/ReportsService
 * @type {Object}
 */
var ReportsService = {

  /**
   * Returns entries and leaving members for the given period.
   * E.g.:
   *   [
   *     {
   *       _id: 000000001
   *       firstName: 'First'
   *       lastName: 'Last'
   *       alucecId: 1
   *       payments: [201501, 201503],
   *       count: 2
   *     }
   *     ...
   *   ]
   * Available options are:
   *   - from: starting month (format: YYYYMM)
   *   - to: starting month (format: YYYYMM)
   *   - quantity: number of unpaid months accepted
   *   - comparison: type of check against number of unpaid months (including quantity)
   *
   * @param  {Object}   options Report options
   * @param  {Function} cb      Callback
   */
  unpaidMonths: function(options, cb) {
    var results = [],
        monthsInPeriod = [],
        defaults = {
          from: moment().format('YYYY') + '01',
          to: moment().format('YYYY') + '12',
          quantity: 3,
          comparison: '>='
        },
        monthIterator,
        minimumPayments,
        paymentsComparison;

    options = _.extend(defaults, options);
    processPeriod(options);

    // Get months within given period and calculate minimum payments needed
    monthIterator = moment(options.from);
    while (monthIterator <= options.to) {
      monthsInPeriod.push(parseInt(monthIterator.format('YYYYMM')));
      monthIterator.add(1, 'months');
    }
    minimumPayments = monthsInPeriod.length - options.quantity;

    // Get number of payments to compare
    if (options.comparison === '=') {
      paymentsComparison = minimumPayments;
    } else {
      paymentsComparison = options.comparison === '>=' ?
        {$lte: minimumPayments} :
        {$gte: minimumPayments};
    }

    // Agreggation query
    Member.aggregate([
      { $match: { 'leaving' : { '$exists' : false } } }, // only non leaving
      { $unwind : '$paidMonths' },
      { $match: { 'paidMonths' : { $in : monthsInPeriod } } }, // only payments in the period
      { $group:
        {
          _id: '$_id',
          alucecId : { $first: '$alucecId'},
          firstName : { $first: '$firstName'},
          lastName : { $first: '$lastName'},
          payments : { $push:'$paidMonths'},
          count: { $sum: 1 } // increase with every payment
        }
      },
      { $match: { 'count' : paymentsComparison } }, // match desired comparison number
      { $sort : { alucecId: 1 } }
    ])
      .exec(cb);
  },

  /**
   * Returns entries and leaving members for the given period.
   * E.g.:
   *   {
   *     entries: [
   *       ...
   *     ],
   *     leaving: [
   *       ...
   *     ]
   *   }
   * Available options are:
   *   - from: starting month (format: YYYYMM)
   *   - to: starting month (format: YYYYMM)
   *
   * @param  {Object}   options Report options
   * @param  {Function} cb      Callback
   */
  membersChanges: function(options, cb) {
    processPeriod(options);

    async.parallel({
      entries: function(cb) {
        Member.find()
          .select('firstName lastName alucecId agent entry')
          .populate({path: 'agent', select:'_id firstName lastName'})
          .where({
            'entry.date': {
              $gte: options.from.startOf('month').toDate(),
              $lte: options.to.endOf('month').toDate(),
            }
          })
          .sort({lastName: 1, firstName: 1})
          .exec(cb);
      },
      leaving: function(cb) {
        Member.find()
          .select('firstName lastName alucecId agent leaving')
          .populate({path: 'agent', select:'_id firstName lastName'})
          .where({
            $or: [
              {
                'leaving.date': {
                  $gte: options.fromDay.toDate(),
                  $lte: options.toDay.toDate(),
                }
              }
            ]
          })
          .sort({lastName: 1, firstName: 1})
          .exec(cb);
      }
    }, cb);
  },

  /**
   * Returns payments summary for the specified months.
   * Includes agents summary data and subtotal, office payments summary and total net.
   *
   * E.g.:
   *   {
   *     agentsSummary: [
   *       {
   *         agent: {
   *           _id: 000001,
   *           firstName: 'First',
   *           lastName: 'Last',
   *           percentage: 0.4
   *         },
   *         summary: {
   *           total: 11000.50,
   *           payments: 530,
   *           commission: 4010,
   *           net: 6989.50
   *         }
   *       },
   *       ...
   *     ],
   *     agentsSubtotal: {
   *       total: 23000.00,
   *       payments: 1200,
   *       commission: 8000.00,
   *       net: 15000.00
   *     },
   *     officeSummary: {
   *       total: 5000,
   *       payments: 100
   *     },
   *     net: 20000,00
   *   }
   *
   * Available options are:
   *   - from: starting month (format: YYYYMM)
   *   - to: starting month (format: YYYYMM)
   *
   * @param  {Object}   options Report options
   * @param  {Function} cb      Callback
   */
  periodBalance: function(options, cb) {
    var results = {},
        resultsAgents = {},
        agents = {},
        defaults = {
          from: moment().format('YYYY') + '01',
          to: moment().format('YYYY') + '12',
        };
    options = _.extend(defaults, options);
    processPeriod(options);

    var getAgent = function(agents, _id) {
      return _.find(agents, function(c) { return c._id.toString() === _id.toString(); });
    };

    async.waterfall([
      function getAgents(_cb) {
        Agent
          .find()
          .select('_id firstName lastName percentage')
          .sort({lastName: 1, firstName: 1})
          .exec(_cb);
      },

      function getAggregatedPayments(agents, _cb) {
        // Agreggation query
        Payment
          .aggregate([
            {
              $match: {
                month: {
                  $gte : options.fromMonth,
                  $lte : options.toMonth,
                }
              }
            },
            {
              $group: {
                _id: '$agent',
                total: { $sum: '$amount' },
                payments: { $sum: 1 }
              }
            }
          ])
          .exec(function(err, aggPayments) {
            if (err) return _cb(err);
            _cb(null, agents, aggPayments);
          });
      },

      // Make summary calculation
      function makeCalculations(agents, aggPayments, _cb) {
        var res = {
            agentsSummary: [],
            agentsSubtotal: {
              total: 0,
              payments: 0,
              commission: 0,
              net: 0
            },
            officeSummary: {
              total: 0,
              payments: 0
            },
            summary: {
              total: 0,
              payments: 0,
              net: 0
            }
          },
          st = res.agentsSubtotal,
          sm = res.summary;

        // Set office summary (aggregated data with agent === null)
        var officeSummary = _.remove(aggPayments, function(data) {
          return data._id === null;
        });
        if (officeSummary.length) {
          res.officeSummary = officeSummary[0];
          delete res.officeSummary._id;
        }

        // Add office subtotla to global summary (no commission)
        sm.total += res.officeSummary.total;
        sm.payments += res.officeSummary.payments;
        sm.net += res.officeSummary.total;

        // Set agents summary
        res.agentsSummary = aggPayments.map(function(data) {
          var summary = _.pick(data, ['total', 'payments']);
          var agent = getAgent(agents, data._id);

          summary.commission = agent.percentage * summary.total;
          summary.net = summary.total - summary.commission;

          // Add values to agents' subtotal
          st.total += summary.total;
          st.payments += summary.payments;
          st.commission += summary.commission;
          st.net += summary.net;

          return {
            agent: agent,
            summary: summary
          };
        });

        // Sort agents by name
        res.agentsSummary = _.sortByAll(res.agentsSummary, ['agent.lastName', 'agent.firstName']);

        // Add st net to global summary
        sm.total += st.total;
        sm.payments += st.payments;
        sm.net += st.net;

        _cb(null, res);
      }
    ], cb);
  },

  /**
   * Returns payments done by member made in the specified month.
   * Allows per-agent filtering.
   *
   * E.g.:
   *   {
   *     paymentsByMember: [
   *       {
   *         _id: 000000001,
   *         payments: [
   *           {
   *             month: 201501,
   *             agent: 0000002,
   *             amount: 30
   *           },
   *           ...
   *         ]
   *       },
   *       ...
   *     ],
   *     members: [
   *       {
   *         _id: 00000001,
   *         firstName: 'John',
   *         lastName: 'Smith',
   *         alucecId: 1
   *       },
   *       ...
   *     ]
   *   }
   *
   * Available options are:
   *   - month: accounting month for payments (format: YYYYMM)
   *   - agent (optional): id for agent filter
   *
   * @param  {Object}   options Report options
   * @param  {Function} cb      Callback
   */
  paymentsByMember: function(options, cb) {
    var results = [],
      defaults = {
        month: moment().format('YYYYMM')
      };

    options = _.extend(defaults, options);
    options.month = parseInt(options.month);

    async.waterfall([
      function getPayments(cb) {
        var $match = { 'accountingMonth' : options.month };
        if (options.agent) {
          $match.agent = new mongoose.Types.ObjectId(options.agent);
        }

        Payment
          .aggregate([
            { $match: $match },
            { $group:
              {
                _id: '$member',
                payments: {
                  $push: {
                    month: '$month',
                    agent: '$agent',
                    amount: '$amount',
                  }
                },
                total: { $sum: '$amount' }
              }
            },
            { $sort: { _id: 1 } }
          ])
          .exec(cb);
      },
      function getMembers(payments, cb) {
        Member
          .find()
          .select('_id firstName lastName alucecId')
          .where({ _id: { $in: _.pluck(payments, ['_id']) } })
          .sort({alucecId: 1})
          .exec(function(err, results) {
            if (err) return cb(err);
            cb(null, payments, results);
          });
      },
    ], function(err, payments, members) {
      cb(err, {
        paymentsByMember: payments,
        members: members
      });
    });
  },
};

/**
 * Auxiliar method to set utility values for period options.
 *
 * @param  {Object} options
 * @return {Object}
 */
var processPeriod = function (options) {
  options.from = moment(options.from + '01', 'YYYYMMDD');
  options.to = moment(options.to + '01', 'YYYYMMDD');
  options.fromDay = options.from.startOf('month');
  options.toDay = options.to.endOf('month');
  options.fromMonth = parseInt(options.from.format('YYYYMM'));
  options.toMonth = parseInt(options.to.format('YYYYMM'));
};

module.exports = ReportsService;
