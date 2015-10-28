var should = require('should'),
    request = require('supertest'),
    express = require('express'),
    http = require('http'),
    async = require('async'),
    config = require('../config/config'),
    utils = require('./utils');

describe('Authentication', function() {

  var _user;

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      function() {
        utils.loadTestUser(function (user) {
          _user = user;
          done();
        });
      }
      ], done);
  });

  it('returns 200 on /', function(done) {
    utils
      .request()
      .get('/')
      .expect(200, done);
  });

  it('returns 401 on secured route', function(done) {
    utils
      .request()
      .get('/members')
      .expect(401, done);
  });

  it('returns 200 on secured route with authorization', function(done) {
    utils
      .request()
      .get('/members')
      .set('Authorization', 'JWT ' + utils.jwt)
      .expect(200, done);
  });

  it('returns 401 on secured route with wrong authorization', function(done) {
    utils
      .request()
      .get('/members')
      .set('Authorization', 'JWT ' + 'wrongtoken')
      .expect(401, done);
  });

});
