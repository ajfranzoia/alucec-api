var should = require('should'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    _ = require('lodash'),
    async = require('async'),
    utils = require('./utils'),
    ConfigService = require('../app/services/ConfigService');

describe('PaymentsRoutes', function () {

  var member, agent, anotherAgent, myPayment;

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      utils.loadTestUser,
      function loadTestData() {
        async.parallel({
          member: function(cb) {
            var data = {
              alucecId: 1,
              firstName: 'John',
              lastName: 'Smith',
            };
            mongoose.model('Member').create(data, cb);
          },
          agent: function(cb) {
            var data = {
              firstName: 'Laura',
              lastName: 'Martin',
              percentage: 0.2
            };
            mongoose.model('Agent').create(data, cb);
          },
          anotherAgent: function(cb) {
            var data = {
              firstName: 'Chris',
              lastName: 'Wilde',
              percentage: 0.4
            };
            mongoose.model('Agent').create(data, cb);
          },
          config: function(cb) {
            var config = {
              feesPeriods: [{from: 201501, to: 201506, value: 30}, {from: 201506, to: 201512, value: 40}],
              mainEmail: 'email@test.com',
              accountingMonth: 201503
            };
            ConfigService.save(config, cb);
          }
        }, function(err, results) {
          if (err) done(err);
          member = JSON.parse(JSON.stringify(results.member));
          agent = JSON.parse(JSON.stringify(results.agent));
          anotherAgent = JSON.parse(JSON.stringify(results.anotherAgent));
          done();
        });
      }
      ], done);
  });

  it('should save new payed payment', function (done) {
    var payment = {
      member: member._id.toString(),
      month: 201501,
      agent: agent._id.toString()
    };

    utils
      .request()
      .post('/payments')
      .setAuth()
      .send(payment)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var saved = res.body;
        myPayment = _.clone(saved);

        saved.should.have.properties('_id', '__v');
        delete saved._id;
        delete saved.__v;
        saved.should.deepEqual({
          member: payment.member,
          month: payment.month,
          agent: payment.agent,
          accountingMonth: 201503,
          amount: 30
        });

        done();
      });
  });

  it('should read payment by id', function (done) {
    var payment = {
      member: member._id.toString(),
      month: 201501,
      agent: agent._id.toString()
    };

    utils
      .request()
      .get('/payments/' + myPayment._id)
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var payment = res.body;
        payment.should.deepEqual({
          _id: myPayment._id,
          __v: myPayment.__v,
          member: myPayment.member,
          month: myPayment.month,
          agent: agent,
          accountingMonth: myPayment.accountingMonth,
          amount: myPayment.amount
        });

        done();
      });
  });

  it('should update payed payment', function (done) {
    var updates = {
      agent: anotherAgent._id,
      amount: 50
    };

    utils
      .request()
      .put('/payments/' + myPayment._id)
      .setAuth()
      .send(updates)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var saved = res.body;
        saved.should.deepEqual({
          _id: myPayment._id,
          __v: 0,
          member: myPayment.member,
          month: myPayment.month,
          agent: anotherAgent._id,
          accountingMonth: myPayment.accountingMonth,
          amount: 50
        });

        myPayment = saved;

        done();
      });
  });

  it('should delete payment', function (done) {
    utils
      .request()
      .del('/payments/' + myPayment._id)
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var deleted = res.body;
        deleted.should.deepEqual(myPayment);

        done();
      });
  });
  it('should fail on inexistent agent', function (done) {
    var error = {
      name: 'NotFoundError',
      message: 'Payment not found'
    };

    var assertNotFoundError = function(cb) {
      return function(err, res) {
        if (err) return done(err);
        res.body.should.deepEqual(error);
        cb();
      };
    };

    async.series([
      function (cb) {
        utils
          .request()
          .get('/payments/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .put('/payments/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .send({})
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .del('/payments/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));
      },
    ], done);
  });

});
