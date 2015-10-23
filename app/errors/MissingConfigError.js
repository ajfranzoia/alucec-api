var util = require('util'),
    AppError = require('./AppError');

module.exports = function MissingConfigError(message) {
  AppError.call(this, message);
};

util.inherits(module.exports, AppError);
