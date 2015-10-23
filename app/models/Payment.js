var mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    Schema = mongoose.Schema;

var paymentSchema = new Schema({
  member: { type: Schema.ObjectId, ref: 'Member', required: true, index: true},
  month: { type: Number, required: true, index: true},
  accountingMonth: { type: Number, required: true, index: true},
  amount: { type: Number, required: true},
  agent: { type: Schema.ObjectId, ref: 'Agent'},
});

module.exports = mongoose.model('Payment', paymentSchema);
