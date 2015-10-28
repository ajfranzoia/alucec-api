var should = require('should'),
    assert = require('assert'),
    mongoose = require('mongoose'),
    async = require('async'),
    _ = require('lodash'),
    utils = require('./utils');

describe('AgentsRoutes', function () {

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      utils.loadTestUser
    ], done);
  });

  var agents = [];

  it('should save new agents', function (done) {
    var agent = {
      firstName: 'John',
      lastName: 'Smith',
      percentage: 0.2
    };

    utils
      .request()
      .post('/agents')
      .setAuth()
      .send(agent)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var saved = res.body;
        saved.firstName.should.equal(agent.firstName);
        saved.lastName.should.equal(agent.lastName);
        saved.percentage.should.equal(agent.percentage);

        agents.push(saved);

        done();
      });
  });

  it('should save another agent', function (done) {
    var agent = {
      firstName: 'Laura',
      lastName: 'Golden',
      percentage: 0.4
    };

    utils
      .request()
      .post('/agents')
      .setAuth()
      .send(agent)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var saved = res.body;
        saved.firstName.should.equal(agent.firstName);
        saved.lastName.should.equal(agent.lastName);
        saved.percentage.should.equal(agent.percentage);

        agents.push(saved);

        done();
      });
  });

  it('should get agent data', function (done) {
    utils
      .request()
      .get('/agents/' + agents[0]._id)
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual(agents[0]);

        done();
      });
  });

  it('should get all agents', function (done) {
    utils
      .request()
      .get('/agents')
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual(_.sortByAll(agents, ['lastName', 'firstName']));
        done();
      });
  });

  it('should update existing agent', function (done) {
    var agent = agents[0];
    var changes = {
      percentage: 0.3,
      firstName: 'John W.'
    };

    var updatedAgent = _.extend(agent, changes);

    utils
      .request()
      .put('/agents/' + agent._id)
      .setAuth()
      .send(changes)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual(updatedAgent);
        done();
      });
  });

  it('should delete agent', function (done) {
    async.series([
      function (cb) {
        var agent = agents[0];

        utils
          .request()
          .del('/agents/' + agent._id)
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            res.body.should.deepEqual(agent);
            cb();
          });
      },
      function (cb) {
        utils
          .request()
          .get('/agents')
          .setAuth()
          .end(function(err, res) {
            if (err) return done(err);

            res.body.length.should.equal(1);
            cb();
          });

      }
    ], done);
  });

  it('should fail on inexistent agent', function (done) {
    var error = {
      name: 'NotFoundError',
      message: 'Agent not found'
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
          .get('/agents/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .put('/agents/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .send({})
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .del('/agents/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));
      },
    ], done);
  });

});
