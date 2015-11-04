var util = require('util'),
    AppError = require('./AppError');

/**
 * MissingConfig error constructor.
 *
 * @exports errors/MissingConfigError
 * @constructor
 */
module.exports = function MissingConfigError(message) {
  AppError.call(this, message);
};

util.inherits(module.exports, AppError);
