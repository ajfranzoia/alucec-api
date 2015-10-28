var should = require('should'),
    request = require('supertest'),
    express = require('express'),
    http = require('http'),
    async = require('async'),
    config = require('../config/config'),
    utils = require('./utils');

describe('UsersRoutes', function() {

  var user;

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb
    ], done);
  });

  it('should register new user', function (done) {
    var data = {
      email: 'me@gmail.com',
      password: 'mypassword',
    };

    utils
      .request()
      .post('/users/register')
      .send(data)
      .expect(200, done);
  });

  it('should fail on register with existing email', function (done) {
    var data = {
      email: 'me@gmail.com',
      password: 'otherpassword',
    };

    utils
      .request()
      .post('/users/register')
      .send(data)
      .expect(400)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual({
          name: 'UserExistsError',
          message: 'A user with the given username is already registered'
        });
        done();
      });
  });

  it('should login user and return user token', function (done) {
    var data = {
      email: 'me@gmail.com',
      password: 'mypassword',
    };

    utils
      .request()
      .post('/users/login')
      .send(data)
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.have.property('token');
        done();
      });
  });

  it('should fail login with wrong credentials', function (done) {
    var data = {
      email: 'me@gmail.com',
      password: 'wrongpassword',
    };

    utils
      .request()
      .post('/users/login')
      .send(data)
      .expect(404)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual({
          name: 'NotFoundError',
          message: 'User not found'
        });
        done();
      });
  });


});
