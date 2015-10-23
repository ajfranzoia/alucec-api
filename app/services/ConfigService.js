var _ = require('lodash'),
    mongoose = require('mongoose'),
    Config = require('../models/Config'),
    MissingConfigError = require('../errors/MissingConfigError');

/**
 * Service that allows ALUCEC app config manipulation
 *
 * @type {Object}
 */
var ConfigService = {

  /**
   * Reads and returns current config from database.
   *
   * @param  {Function} cb Callback
   */
  get: function(cb) {
    Config.findOne().exec(function(err, res) {
      if (err) return cb(res);

      if (!res || _.isEmpty(res)) {
        cb(new MissingConfigError('Can\'t read app config: it is empty!'));
      }

      var config = res.toJSON();
      delete config._id;
      delete config.__v;

      return cb(null, config);
    });
  },

  /**
   * Saved config to database.
   *
   * @param  {Object} data New config values
   * @param  {Function} cb Callback
   */
  save: function(data, cb) {
    Config.findOne().exec(function(err, res) {
      if (err) return cb(res);

      if (!res) {
        res = new Config(data);
      } else {
        _.extend(res, data);
      }

      res.save(function(err, res) {
        ConfigService.get(cb);
      });
    });
  },

  /**
   * Returns amount related to given config and month
   *
   * @param  {Object} data New config values
   * @param  {Function} cb Callback
   * @return {Number}
   */
  getMonthPaymentAmount: function(config, month) {
    if (!config.feesPeriods) {
      return new MissingConfigError('Payment month not found');
    }

    var period = _.find(config.feesPeriods, function(period) {
      return period.from <= month && period.to >= month;
    });

    if (!period) {
      return new MissingConfigError('Payment month not found');
    }

    return period.value;
  }

}

module.exports = ConfigService;
