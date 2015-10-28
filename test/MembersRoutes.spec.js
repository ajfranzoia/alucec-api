var should = require('should'),
    assert = require('assert'),
    _ = require('lodash'),
    async = require('async'),
    utils = require('./utils'),
    Agent = require('../app/models/Agent'),
    Member = require('../app/models/Member');

describe('MembersRoutes', function () {

  var member, agent;

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      utils.loadTestUser,
      function loadTestData(cb) {
        async.parallel({
          agent: function(cb) {
            var data = {
              firstName: 'Laura',
              lastName: 'Martin',
              percentage: 0.2
            };
            Agent.create(data, cb);
          },
          anotherAgent: function(cb) {
            var data = {
              firstName: 'Chris',
              lastName: 'Wilde',
              percentage: 0.4
            };
            Agent.create(data, cb);
          }
        }, function(err, results) {
          if (err) done(err);
          agent = JSON.parse(JSON.stringify(results.agent));
          anotherAgent = JSON.parse(JSON.stringify(results.anotherAgent));
          cb();
        });
    }
    ], done);
  });

  it('should save new members', function (done) {
    var data = {
      alucecId: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@smith.com',
      address: 'Street A 123',
      phone: '12345678',
      entry: {
        date: '2015-01-01'
      },
      dni: 987654321,
      observations: 'First member!',
      agent: agent._id
    };

    utils
      .request()
      .post('/members')
      .setAuth()
      .send(data)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        var saved = res.body;

        saved.should.have.properties('_id', '__v');
        saved.alucecId.should.equal(data.alucecId);
        saved.firstName.should.equal(data.firstName);
        saved.lastName.should.equal(data.lastName);
        saved.email.should.equal(data.email);
        saved.address.should.equal(data.address);
        saved.phone.should.equal(data.phone);
        saved.entry.should.deepEqual({date: '2015-01-01T00:00:00.000Z'});
        saved.dni.should.equal(data.dni);
        saved.observations.should.equal(data.observations);
        saved.agent.should.equal(data.agent);
        saved.paidMonths.should.deepEqual([]);

        member = saved;
        done();
      });
  });

  it('should return correct member data', function (done) {
    utils
      .request()
      .get('/members/' + member._id)
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual({
          _id: member._id,
          alucecId: 1,
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@smith.com',
          address: 'Street A 123',
          phone: '12345678',
          entry: {
            date: '2015-01-01T00:00:00.000Z'
          },
          dni: 987654321,
          observations: 'First member!',
          agent: agent,
          paidMonths: [],
          payments: [],
          __v: 0
        });

        done();
      });
  });

  it('should return correct next member id', function (done) {
    utils
      .request()
      .get('/members/nextAlucecId')
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.deepEqual({alucecId: 2});
        done();
      });
  });

  it('should update member', function (done) {
    utils
      .request()
      .put('/members/' + member._id)
      .send({firstName: 'John W.'})
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.firstName.should.equal('John W.');
        done();
      });
  });

  it('should set leaving data', function (done) {
    utils
      .request()
      .put('/members/' + member._id + '/set-leaving')
      .send({
        date: '2015-03-04',
        reason: 'Ran out of money'
      })
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.leaving.should.deepEqual({
          date: '2015-03-04T00:00:00.000Z',
          reason: 'Ran out of money'
        });
        done();
      });
  });

  it('should remove leaving data', function (done) {
    utils
      .request()
      .put('/members/' + member._id + '/remove-leaving')
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);

        res.body.should.not.have.property('leaving');
        done();
      });
  });

  it('should delete member', function (done) {
    async.series([
      function (cb) {
        utils
          .request()
          .del('/members/' + member._id)
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            res.body._id.should.equal(member._id);
            cb();
          });
      },
      function (cb) {
        utils
          .request()
          .get('/members')
          .setAuth()
          .end(function(err, res) {
            if (err) return done(err);

            res.body.length.should.equal(0);
            cb();
          });
      },
    ], done);
  });

  it('should list members properly', function (done) {
    var data1 = {
      alucecId: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@smith.com',
      address: 'Street A 123',
      phone: '12345678',
      entry: {
        date: '2015-01-01'
      },
      dni: 987654321,
      observations: 'First member!',
      agent: agent._id
    };

    var data2 = {
      alucecId: 2,
      firstName: 'Laura',
      lastName: 'Warnt',
      leaving: {
        date: '2015-02-10',
        reason: 'None given'
      },
    };

    var member1, member2;

    async.series([
      function createMember1(cb) {
        Member.create(data1, function(err, member) {

          member1 = JSON.parse(JSON.stringify(member));
          cb(err, member);
        });
      },
      function createMember2(cb) {
        Member.create(data2, function(err, member) {
          member2 = JSON.parse(JSON.stringify(member));
          cb(err, member);
        });
      },
      function listAll(cb) {
        utils
          .request()
          .get('/members')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(2);
            results.should.deepEqual([member1, member2]);

            cb();
          });
      },
      function listAllWithSort(cb) {
        utils
          .request()
          .get('/members?sort=alucecId&direction=desc')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(2);
            results.should.deepEqual([member2, member1]);

            cb();
          });
      },
      function listByStatus1(cb) {
        utils
          .request()
          .get('/members?status=1')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(1);
            results.should.deepEqual([member1]);

            cb();
          });
      },
      function listByStatus0(cb) {
        utils
          .request()
          .get('/members?status=0')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(1);
            results.should.deepEqual([member2]);

            cb();
          });
      },
      function listByName(cb) {
        utils
          .request()
          .get('/members?search=smit')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(1);
            results.should.deepEqual([member1]);

            cb();
          });
      },
      function listById(cb) {
        utils
          .request()
          .get('/members?search=2')
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);

            var results = res.body;
            results.length.should.equal(1);
            results.should.deepEqual([member2]);

            cb();
          });
      }
    ], done);
  });

  it('should fail on inexistent member', function (done) {
    var error = {
      name: 'NotFoundError',
      message: 'Member not found'
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
          .get('/members/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .put('/members/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .send({})
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));

      },
      function (cb) {
        utils
          .request()
          .del('/members/FFFFFFFFFFFFFFFFFFFFFFFF')
          .setAuth()
          .expect('Content-Type', /json/)
          .expect(404)
          .end(assertNotFoundError(cb));
      },
    ], done);
  });

});
