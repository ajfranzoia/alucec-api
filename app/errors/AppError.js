var util = require('util');

/**
 * Base App error class.
 *
 * @exports errors/AppError
 * @constructor
 */
module.exports = function AppError(message) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = this.constructor.name;
  this.message = message;
};

util.inherits(module.exports, Error);
