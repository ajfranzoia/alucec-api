var mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    Schema = mongoose.Schema;

/**
 * Payment model.
 * Represents a payment done by a member for a given month.
 * It is accounted to the current configured accounting month.
 * Can be collected by an agent or not.
 *
 * @exports models/Payment
 * @type {Object}
 */
var paymentSchema = new Schema({
  member: { type: Schema.ObjectId, ref: 'Member', required: true, index: true},
  month: { type: Number, required: true, index: true},
  accountingMonth: { type: Number, required: true, index: true},
  amount: { type: Number, required: true},
  agent: { type: Schema.ObjectId, ref: 'Agent'},
});

module.exports = mongoose.model('Payment', paymentSchema);
