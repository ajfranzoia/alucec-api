var should = require('should'),
    assert = require('assert'),
    _ = require('lodash'),
    async = require('async'),
    utils = require('./utils'),
    ConfigService = require('../app/services/ConfigService'),
    PaymentError = require('../app/errors/PaymentError'),
    MissingConfigError = require('../app/errors/MissingConfigError'),
    Member = require('../app/models/Member'),
    Payment = require('../app/models/Payment'),
    Agent = require('../app/models/Agent'),
    PaymentsService = require('../app/services/PaymentsService');

describe('PaymentsService', function () {

  var member, agent, anotherAgent, myPayment, payment201501;

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
            Member.create(data, cb);
          },
          agent: function(cb) {
            var data = {
              firstName: 'Laura',
              lastName: 'Martin',
              percentage: 0.2
            };
            Agent.create(data, cb);
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
          done();
        });
      }
      ], done);
  });

  it('should set proper paid months', function (done) {
    async.parallel([
      function(cb) {
        PaymentsService.pay({
          member: member._id,
          month: 201501,
          agent: agent._id
        }, function(err, payment) {
          payment201501 = payment;
          cb(err, payment);
        });
      },
      function(cb) {
        PaymentsService.pay({
          member: member._id,
          month: 201503,
          agent: agent._id
        }, cb);
      },
      function(cb) {
        PaymentsService.pay({
          member: member._id,
          month: 201508,
          agent: agent._id
        }, cb);
      },
    ], function(err, results) {
      if (err) return done(err);

      mongoose.model('Member').findById(member._id, function(err, res) {
        res.toJSON().paidMonths.sort().should.deepEqual([201501, 201503, 201508]);
        done();
      });
    });

  });

  it('should set remove non-paid month', function (done) {
    async.parallel([
      function(cb) {
        PaymentsService.unpay(payment201501._id, cb);
      },
    ], function(err, results) {
      if (err) return done(err);

      mongoose.model('Member').findById(member._id, function(err, res) {
        res.toJSON().paidMonths.sort().should.deepEqual([201503, 201508]);
        done();
      });
    });
  });

  it('should fail on alreaid paid month', function (done) {
    async.parallel([
      function(cb) {
        PaymentsService.pay({
          member: member._id,
          month: 201508,
          agent: agent._id
        }, cb);
      },
    ], function(err, results) {
      err.should.be.instanceof(PaymentError);
      err.message.should.equal('Month already paid');
      done();
    });
  });

  it('should fail on month without configured value', function (done) {
    async.parallel([
      function(cb) {
        PaymentsService.pay({
          member: member._id,
          month: 201601,
          agent: agent._id
        }, cb);
      },
    ], function(err, results) {
      err.should.be.instanceof(MissingConfigError);
      err.message.should.equal('Payment month not found');
      done();
    });
  });

});
