var util = require('util'),
    AppError = require('./AppError');

module.exports = function NotFoundError(message) {
  AppError.call(this, message);
  this.status = 404;
};

util.inherits(module.exports, AppError);
