var ConfigService = require('../services/ConfigService');

/**
 * ALUCEC configuration actions.
 *
 * @type {Object}
 */
var ConfigController = {

  /**
   * Get current configuration.
   * Calls ConfigService.get()
   */
  get: function (req, res, next) {
    ConfigService.get(function (err, config) {
      if (err) return next(err);
      res.send(config);
    });
  },

  /**
   * Update current configuration.
   * Calls ConfigService.save()
   */
  update: function (req, res, next) {
    ConfigService.save(req.body, function (err, config) {
      if (err) return next(err);
      res.send(config);
    });
  }

};

module.exports = ConfigController;
