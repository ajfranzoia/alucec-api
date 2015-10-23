var should = require('should'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    async = require('async'),
    utils = require('./utils');

describe('ConfigRoutes', function () {

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      utils.loadTestUser
    ], done);
  });

  it('should save new config', function (done) {
    var saveConfig = {
      feesPeriods: [{from: 201501, to: 201506, value: 30}, {from: 201506, to: 201512, value: 40}],
      mainEmail: 'email@test.com',
      accountingMonth: 201501
    };

    utils
      .request()
      .put('/config')
      .setAuth()
      .send(saveConfig)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.should.deepEqual(saveConfig);
        done();
      });
  });

  it('should update partial config', function (done) {
    var updateConfig = {
      mainEmail: 'new_email@test.com',
    };

    var expectedConfig = {
      feesPeriods: [{from: 201501, to: 201506, value: 30}, {from: 201506, to: 201512, value: 40}],
      mainEmail: 'new_email@test.com',
      accountingMonth: 201501
    };

    utils
      .request()
      .put('/config')
      .setAuth()
      .send(updateConfig)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.should.deepEqual(expectedConfig);
        done();
      });
  });

  it('should return final config', function (done) {
    var expectedConfig = {
      feesPeriods: [{from: 201501, to: 201506, value: 30}, {from: 201506, to: 201512, value: 40}],
      mainEmail: 'new_email@test.com',
      accountingMonth: 201501
    };

    utils
      .request()
      .get('/config')
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        res.body.should.deepEqual(expectedConfig);
        done();
      });
  });

});
