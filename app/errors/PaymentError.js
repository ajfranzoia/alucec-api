var util = require('util'),
    AppError = require('./AppError');

/**
 * Payment related error constructor.
 *
 * @exports errors/PaymentError
 * @constructor
 */
module.exports = function PaymentError(message) {
  AppError.call(this, message);
};

util.inherits(module.exports, AppError);
