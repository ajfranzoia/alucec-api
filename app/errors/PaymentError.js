var util = require('util'),
    AppError = require('./AppError');

module.exports = function PaymentError(message) {
  AppError.call(this, message);
};

util.inherits(module.exports, AppError);
