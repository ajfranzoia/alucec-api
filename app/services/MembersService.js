var _ = require('lodash'),
    mongoose = require('mongoose'),
    Payment = mongoose.model('Payment'),
    Member = mongoose.model('Member');

/**
 * Members management service.
 *
 * @exports services/MembersService
 * @type {Object}
 */
var MembersService = {

  /**
   * Returns next ALUCEC member id.
   *
   * @param  {Function} cb Callback
   */
  getNextAlucecId: function (cb) {
    Member.find().sort({'alucecId': -1}).limit(1).exec(function(err, res) {
      if (err) return cb(err);
      cb(null, res ? res[0].alucecId + 1 : 1);
    });
  },

  /**
   * Lists members.
   * Available search options are:
   *   - status: 0 for leaving, 1 for active
   *   - search: searchs in firstName/lastName if string, and in dni/alucecId if number
   *
   * @param  {Object} options
   * @param  {Function} cb Callback
   */
  list: function(options, cb) {
    var filter = {}, sort = {}, search;

    if (!options.limit) {
      options.limit = 20;
    }

    if (options.status) {
      filter.leaving = options.status === '1' ? null : {$ne: null};
    }

    search = options.search;
    if (search) {
      filter.$or = [];

      // If number, search in dni and alucecId as well
      if (/^\+?(0|[1-9]\d*)$/.test(search)) {
        filter.$or.push({ dni: options.search });
        filter.$or.push({ alucecId: options.search });
      } else {
        filter.$or.push({ firstName:  { $regex: new RegExp(options.search, 'i')} });
        filter.$or.push({ lastName:  { $regex: new RegExp(options.search, 'i')} });
      }
    }

    if (options.sort) {
      sort[options.sort] = (options.direction === 'desc' ? -1 : 1);
    }

    Member.find(filter).sort(sort).limit(options.limit).exec(function (err, members) {
      if (err) return cb(err);
      cb(null, members);
    });
  },

  /**
   * Create new member.
   *
   * @param  {Object} data Member data
   * @param  {Function} cb Callback
   */
  create: function(data, cb) {
    Member.create(data, cb);
  },

  /**
   * Update existing member.
   *
   * @param  {Object} data Member
   * @param  {Object} data New data
   * @param  {Function} cb Callback
   */
  update: function(member, update, cb) {
    _.extend(member, update);
    member.save(function (err, member) {
      if (err) return cb(err);
      cb(null, member);
    });
  },

  /**
   * Remove existing member.
   *
   * @param  {Object} data Member
   * @param  {Function} cb Callback
   */
  remove: function(member, cb) {
    member.remove(cb);
  },

  /**
   * Populate member with payments made.
   * Attachs 'payments' property.
   *
   * @param  {Object} data Member
   * @param  {Function} cb Callback
   */
  populatePayments: function(member, cb) {
    Payment.find({member: member}).exec(function (err, payments) {
      if (err) return cb(err);

      member = member.toJSON();
      member.payments = payments;

      return cb(null, member);
    });
  },

  /**
   * Set member as leaving.
   * Leaving info must have 'date' param, optionally 'reason'.
   *
   * @param  {Object} member Member
   * @param  {Object} data Leaving data
   * @param  {Function} cb Callback
   */
  setLeaving: function(member, data, cb) {
    var update = {
      leaving: {
        date: data.date,
        reason: data.reason || null
      }
    };

    _.extend(member, update);
    member.save(function (err) {
      if (err) return cb(err);
      cb(null, member);
    });
  },

  /**
   * Set member as non-leaving.
   *
   * @param  {Object} member Member
   * @param  {Function} cb Callback
   */
  removeLeaving: function(member, cb) {
    member.leaving = undefined;

    member.save(function (err) {
      if (err) return cb(err);
      cb(null, member);
    });
  }

};

module.exports = MembersService;
