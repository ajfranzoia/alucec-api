var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Config model.
 * Holds current ALUCEC app config.
 *
 * @exports models/Config
 * @type {Object}
 */
var ConfigSchema = new Schema({
  feesPeriods: {type: Array, required: true},
  mainEmail: {type: String, required: true},
  accountingMonth: {type: Number, required: true},
});

module.exports = mongoose.model('Config', ConfigSchema);

