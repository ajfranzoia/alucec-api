var util = require('util'),
    AppError = require('./AppError');

/**
 * Not found error constructor.
 *
 * @exports errors/NotFoundError
 * @constructor
 */
module.exports = function NotFoundError(message) {
  AppError.call(this, message);
  this.status = 404;
};

util.inherits(module.exports, AppError);
