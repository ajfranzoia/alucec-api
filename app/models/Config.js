var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConfigSchema = new Schema({
  feesPeriods: {type: Array, required: true},
  mainEmail: {type: String, required: true},
  accountingMonth: {type: Number, required: true},
});

module.exports = mongoose.model('Config', ConfigSchema);

