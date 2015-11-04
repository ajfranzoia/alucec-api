var mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    uniqueValidator = require('mongoose-unique-validator'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate');

/**
 * Member model.
 * Represents a member of the organization.
 *
 * @exports models/Member
 * @type {Object}
 */
var memberSchema = new Schema({
  alucecId: { type: Number, required: true, index: {unique: true} },
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: {type: String, validate: validate({validator: 'isEmail'})},
  address: String,
  phone: String,
  dni: Number,
  observations: String,
  entry: {
    date: { type: Date, default: Date.now, required: true }
  },
  leaving: {
    date: Date,
    reason: String
  },
  agent: { type: Schema.ObjectId, ref: 'Agent'},
  paidMonths: [Number]
});

memberSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
memberSchema.plugin(mongoosePaginate);

memberSchema.virtual('created').get(function(){
  return this._id.getTimestamp();
});

module.exports = mongoose.model('Member', memberSchema);

