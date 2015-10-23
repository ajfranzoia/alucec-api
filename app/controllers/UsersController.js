var _ = require('lodash'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    passport = require('passport'),
    jwt = require('jsonwebtoken'),
    NotFoundError = require('../errors/NotFoundError');
    config = require('../../config/config');

/**
 * Users actions.
 *
 * @type {Object}
 */
var UsersController = {

  /**
   * Register new user.
   * Required fields are 'email' and 'password'.
   */
  register: function(req, res, next) {
    User.register(new User({ email : req.body.email }), req.body.password, function(err, user) {
      if (err) return next(err);
      return res.sendStatus(200);
    });
  },

  /**
   * Login user.
   * Returns {token: token} object, where 'token' is the jwt token.
   */
  login: function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err) }

      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      // Create JWT token
      var token = jwt.sign({ email: user.email}, config.jwt.secret, {expiresInMinutes: config.jwt.expiresInMinutes});
      res.send({ token : token });

    })(req, res, next);
  },

}

module.exports = UsersController;
