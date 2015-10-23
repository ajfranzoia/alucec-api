var util = require('util');

module.exports = function AppError(message) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
};

util.inherits(module.exports, Error);
