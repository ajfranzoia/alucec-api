var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var User = require('../app/models/User');

module.exports = function(app, config) {
  passport.use(new LocalStrategy({usernameField: 'email'}, User.authenticate()));
  passport.use(new JwtStrategy({secretOrKey: config.jwt.secret}, findUserByTokenPayloadEmail));

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
}

function findUserByTokenPayloadEmail(jwtPayload, done) {
  User.findOne({email: jwtPayload.email}, function(err, user) {
    if (err) {
      return done(err, false);
    }

    if (!user) {
      done('Unauthorized', false);
    }

    done(null, user);
  });
}
