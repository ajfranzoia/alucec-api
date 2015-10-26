var _ = require('lodash'),
    path = require('path'),
    glob = require('glob'),
    mongoose = require('mongoose'),
    fixtures = require('pow-mongoose-fixtures'),
    jwt = require('jsonwebtoken'),
    config = require('../config/config'),
    express = require('express'),
    supertest = require('supertest'),
    superagent = require('superagent'),
    async = require('async');

require('better-log').install({depth: 5});

// Ensure the NODE_ENV is set to 'test'
if (process.env.NODE_ENV != 'test') {
  throw 'NODE_ENV must be set to "test"';
}

utils = {};
utils.jwt = null;
utils.app = null;

superagent.Request.prototype.setAuth = function() {
  if (utils.jwt) {
    this.set('Authorization', 'JWT ' + utils.jwt);
  }
  return this;
}

utils.cleanModel = function(modelName, cb) {
  mongoose.model(modelName).remove({}, cb);
}

utils.cleanDb = function(cb) {
  var collections = _.keys(mongoose.connection.collections)
  async.forEach(collections, function(collectionName, done) {
    var collection = mongoose.connection.collections[collectionName]
    collection.drop(function(err) {
      if (err && err.message != 'ns not found') return done(err);
      done(null);
    })
  }, cb);
}

utils.loadFixture = function(file, cb) {
  fixtures.load('./fixtures/' + file + '.js', mongoose, function(err, results) {
    if (err) return cb(err);
    cb();
  });
}

utils.initApp = function(cb) {
  if (!utils.app) {
    utils.app = require('../app/app')(express(), config);
  }

  cb(null, utils.app);
}

utils.request = function() {
  var req = supertest(utils.app);
  return req;
}

utils.loadTestUser = function(cb) {
  var email = 'test@email.com',
      password = 'mypass',
      User = mongoose.model('User');

  User.register(new User({ email : email }), password, function(err, user) {
    if (err) { throw err };

    utils.jwt = jwt.sign({ email: user.email}, config.jwt.secret, {expiresInMinutes: config.jwt.expiresInMinutes});
    cb(null, user);
  });
}

utils.setupDB = function() {

  var models = glob.sync(config.root + '/app/models/*.js');
  models.forEach(function (model) {
    require(model);
  });

  before(function (done) {
    mongoose.connect(config.db);
    var db = mongoose.connection;

    db.once('open', function (callback) {
    });

    db.on('error', function () {
      throw new Error('Unable to connect to database at ' + config.db);
    });

    done();
  });

  after(function (done) {
    mongoose.disconnect();
    return done();
  });

}

module.exports = utils;
