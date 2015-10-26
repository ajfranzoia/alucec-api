var should = require('should'),
    assert = require('assert'),
    _ = require('lodash'),
    async = require('async'),
    utils = require('./utils'),
    Agent = require('../app/models/Agent'),
    Member = require('../app/models/Member');

describe('ReportsRoutes', function () {

  before(function (done) {
    async.series([
      utils.initApp,
      utils.cleanDb,
      function(cb) {
        utils.loadFixture('reports', cb);
      },
      utils.loadTestUser,
    ], done);
  });

  it('should return members changes', function (done) {
    utils
      .request()
      .get('/reports/members-changes')
      .query({
        from: 201508,
        to: 201509
      })
      .setAuth()
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        var results = res.body;
        _.pluck(results.entries, 'alucecId').sort().should.deepEqual([2, 3, 4]);
        _.pluck(results.leaving, 'alucecId').sort().should.deepEqual([6]);
        results.entries[0].should.have.properties('_id', 'alucecId', 'firstName', 'lastName', 'agent', 'entry');
        results.leaving[0].should.have.properties('_id', 'alucecId', 'firstName', 'lastName', 'agent', 'leaving');
      })
      .end(done);
  });

  it('should return unpaid months report', function (done) {
    async.series([
      function(cb) {
        utils
          .request()
          .get('/reports/unpaid-months')
          .query({
            from: 201507,
            to: 201510,
            quantity: 2
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual([
              {
                _id: '000000000000000000000002',
                firstName: "Kristopher",
                lastName: "Cruickshank",
                alucecId : 2,
                payments : [201509, 201510],
                count: 2
              },
              {
                _id: '000000000000000000000003',
                firstName: "Alessandro",
                lastName: "Klein",
                alucecId : 3,
                payments : [201509],
                count: 1
              },
              {
                _id: '000000000000000000000004',
                firstName: "Jonathon",
                lastName: "Okuneva",
                alucecId : 4,
                payments : [201510],
                count: 1
              }
            ]);
          })
          .end(cb);
      },
      function(cb) {
        utils
          .request()
          .get('/reports/unpaid-months')
          .query({
            from: 201507,
            to: 201510,
            quantity: 1,
            comparison: '='
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual([
              {
                _id: '000000000000000000000001',
                firstName: "Ida",
                lastName: "Abernathy",
                alucecId : 1,
                payments : [201507, 201509, 201510],
                count: 3
              }
            ]);
          })
          .end(cb);
      },
      function(cb) {
        utils
          .request()
          .get('/reports/unpaid-months')
          .query({
            from: 201507,
            to: 201510,
            quantity: 0,
            comparison: '='
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual([]);
          })
          .end(cb);
      },
      function(cb) {
        utils
          .request()
          .get('/reports/unpaid-months')
          .query({
            from: 201507,
            to: 201510,
            quantity: 2,
            comparison: '<='
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual([
              {
                _id: '000000000000000000000001',
                firstName: "Ida",
                lastName: "Abernathy",
                alucecId : 1,
                payments : [201507, 201509, 201510],
                count: 3
              },
              {
                _id: '000000000000000000000002',
                firstName: "Kristopher",
                lastName: "Cruickshank",
                alucecId : 2,
                payments : [201509, 201510],
                count: 2
              }
            ]);
          })
          .end(cb);
      },
      function(cb) {
        utils
          .request()
          .get('/reports/unpaid-months')
          .query({
            from: 201508,
            to: 201510,
            quantity: 1,
            comparison: '='
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual([
              {
                _id: '000000000000000000000001',
                firstName: "Ida",
                lastName: "Abernathy",
                alucecId : 1,
                payments : [201509, 201510],
                count: 2
              },
              {
                _id: '000000000000000000000002',
                firstName: "Kristopher",
                lastName: "Cruickshank",
                alucecId : 2,
                payments : [201509, 201510],
                count: 2
              }
            ]);
          })
          .end(cb);
      }
    ], done);
  });

  it('should return proper period balance report', function(done) {
    async.series([
      function assertFullYearReport(cb) {
        utils
          .request()
          .get('/reports/period-balance')
          .query({
            from: 201501,
            to: 201512
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual({
              agentsSummary: [
                {
                  agent: {
                    "_id": "000000000000000000000001",
                    "firstName": "Agent",
                    "lastName": "A",
                    "percentage": 0.2,
                  },
                  summary: {
                    total: 100,
                    payments: 5,
                    commission: 20,
                    net: 80
                  }
                },
                {
                  agent: {
                    "_id": "000000000000000000000002",
                    "firstName": "Agent",
                    "lastName": "B",
                    "percentage": 0.5,
                  },
                  summary: {
                    total: 150,
                    payments: 5,
                    commission: 75,
                    net: 75
                  }
                }
              ],
              agentsSubtotal: {
                total: 250,
                payments: 10,
                commission: 95,
                net: 155
              },
              officeSummary: {
                total: 30,
                payments: 1
              },
              summary: {
                total: 280,
                payments: 11,
                net: 185
              }
            });
          })
          .end(cb);
      },
      function assertMonthReport(cb) {
        utils
          .request()
          .get('/reports/period-balance')
          .query({
            from: 201509,
            to: 201509
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect(function(res) {
            var results = res.body;

            results.should.deepEqual({
              agentsSummary: [
                {
                  agent: {
                    "_id": "000000000000000000000001",
                    "firstName": "Agent",
                    "lastName": "A",
                    "percentage": 0.2,
                  },
                  summary: {
                    total: 40,
                    payments: 2,
                    commission: 8,
                    net: 32
                  }
                },
                {
                  agent: {
                    "_id": "000000000000000000000002",
                    "firstName": "Agent",
                    "lastName": "B",
                    "percentage": 0.5,
                  },
                  summary: {
                    total: 30,
                    payments: 1,
                    commission: 15,
                    net: 15
                  }
                }
              ],
              agentsSubtotal: {
                total: 70,
                payments: 3,
                commission: 23,
                net: 47
              },
              officeSummary: {
                total: 30,
                payments: 1
              },
              summary: {
                total: 100,
                payments: 4,
                net: 77
              }
            });
          })
          .end(cb);
      },

      ], done);
  });

  it('should return proper payments by member report', function(done) {
    async.series([
      function reportFor201509(cb) {
        return cb();
        utils
          .request()
          .get('/reports/payments-by-member')
          .query({
            month: 201509,
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({
            paymentsByMember: [
              {
                _id: '000000000000000000000001',
                payments: [
                  {
                    month: 201509,
                    agent: '000000000000000000000001',
                    amount: 20
                  }
                ],
                total: 20
              },
              {
                _id: '000000000000000000000002',
                payments: [
                  {
                    month: 201509,
                    agent: '000000000000000000000001',
                    amount: 20
                  }
                ],
                total: 20
              },
              {
                _id: '000000000000000000000003',
                payments: [
                  {
                    month: 201509,
                    agent: '000000000000000000000002',
                    amount: 30
                  }
                ],
                total: 30
              }
            ],
            members: [
              {
                '_id': '000000000000000000000001',
                'firstName': 'Ida',
                'lastName': 'Abernathy',
                'alucecId': 1,
              },
              {
                '_id': '000000000000000000000002',
                'firstName': 'Kristopher',
                'lastName': 'Cruickshank',
                'alucecId': 2,
              },
              {
                '_id': '000000000000000000000003',
                'firstName': 'Alessandro',
                'lastName': 'Klein',
                'alucecId': 3,
              },
            ]
          })
          .end(cb);
      },
      function reportFor201510AndAgent2(cb) {
        utils
          .request()
          .get('/reports/payments-by-member')
          .query({
            month: 201510,
            agent: '000000000000000000000002'
          })
          .setAuth()
          .expect(200)
          .expect('Content-Type', /json/)
          .expect({
            paymentsByMember: [
              {
                _id: '000000000000000000000004',
                payments: [
                  {
                    month: 201510,
                    agent: '000000000000000000000002',
                    amount: 30
                  }
                ],
                total: 30
              },
              {
                _id: '000000000000000000000006',
                payments: [
                  {
                    month: 201506,
                    agent: '000000000000000000000002',
                    amount: 30
                  },
                  {
                    month: 201507,
                    agent: '000000000000000000000002',
                    amount: 30
                  },
                  {
                    month: 201508,
                    agent: '000000000000000000000002',
                    amount: 30
                  },
                ],
                total: 90
              }
            ],
            members: [
              {
                '_id': '000000000000000000000004',
                'firstName': 'Jonathon',
                'lastName': 'Okuneva',
                'alucecId': 4,
              },
              {
                '_id': '000000000000000000000006',
                'firstName': 'John',
                'lastName': 'Russel',
                'alucecId': 6,
              },
            ]
          })
          .end(cb);
      }
      ], done);
  });

});
