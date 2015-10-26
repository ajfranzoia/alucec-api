var _ = require('lodash'),
    async = require('async'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Member = mongoose.model('Member'),
    ConfigService = require('../services/ConfigService')
    PaymentError = require('../errors/PaymentError');

/**
 * Manages member's payments.
 *
 * @type {Object}
 */
var PaymentsService = {

  /**
   * Pays monthly payment for specified member.
   * Requires 'member' and 'month' properties to be present.
   * Sets 'accountingMonth' and 'amount' from current configuration.
   * If 'agent' not present, reads from member's set agent.
   *
   * @param  {Object} data Payment data
   * @param  {Function} cb
   * @return {undefined}
   */
  pay: function(data, cb) {
    var member;

    if (!data.member || !data.month) {
      return cb(new PaymentError('Missing member and/or month'));
    }

    async.waterfall([

      // If agent not set in payment, set agent to member's agent
      function(_cb) {
        Member.findById(data.member).exec(function(err, _member) {
          if (err) return _cb(err);
          member = _member;

          // Check if already paid
          if (member.paidMonths && member.paidMonths.indexOf(data.month) !== -1) {
            return _cb(new PaymentError('Month already paid'));
          }

          if (!data.agent) {
            data.agent = member.agent;
          }

          _cb(null, data);
        });
      },

      // Sets current accounting month and amount, save payment
      function(data, _cb) {
        ConfigService.get(function(err, config) {
          if (err) return _cb(err);

          data.accountingMonth = config.accountingMonth;

          var amount = ConfigService.getMonthPaymentAmount(config, data.month);
          if (amount instanceof Error) {
            return _cb(amount);
          }

          data.amount = amount;
          Payment.create(data, _cb);
        })
      },

      // Update member's paid months using $addToSet with sorting
      function(payment, _cb) {
        Member.update(
          { _id : member._id  },
          { $addToSet :
            {
              paidMonths : {
                $each: [ payment.month ],
                $sort: 1
              }
            }
          },
          function(err, res) {
            _cb(err, payment)
          }
        );
      }
    ], cb);
  },

  /**
   * Remove payment by 'id'.
   *
   * @param  {String}   id
   * @param  {Function} cb
   */
  unpay: function(id, cb) {
    async.waterfall([

      // Remove payment
      function(cb) {
        Payment.findOneAndRemove({_id: id}, cb);
      },

      // Get member
      function getMember(payment, cb) {
        Member.findById(payment.member, function(err, res) {
          if (err) return cb(err);
          cb(null, payment, res);
        })
      },

      // Remove paid month
      function removePaidMonth(payment, member, cb) {
        member.paidMonths.splice(member.paidMonths.indexOf(payment.month), 1);
        member.save(function(err, res) {
          if (err) return cb(err);
          cb(null, payment);
        });
      },

    ], cb);
  },

  /**
   * Update given payment.
   *
   * @param  {Object}   payment
   * @param  {Object}   data
   * @param  {Function} cb
   */
  update: function (payment, data, cb) {
    _.extend(payment, _.pick(data, ['agent', 'amount']));
    payment.save(function (err, payment) {
      if (err) return cb(err);
      cb(null, payment);
    });
  },

}

module.exports = PaymentsService;
