var mongoose = require('mongoose'),
    validate = require('mongoose-validator'),
    uniqueValidator = require('mongoose-unique-validator'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

/**
 * User model.
 * Represents a user of the application.
 *
 * @exports models/User
 * @type {Object}
 */
var userSchema = new Schema({});

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  usernameUnique: true,
  usernameLowerCase: true
});

module.exports = mongoose.model('User', userSchema);

