var mongoose = require('mongoose'),
    Agent = mongoose.model('Agent');

/**
 * Agents actions.
 *
 * @type {Object}
 */
var AgentsController = {

  /**
   * List agents.
   * Sorts by lastName and firstName by default.
   */
  list: function (req, res, next) {
    Agent.find().sort({lastName: 1, firstName: 1}).exec(function (err, agents) {
      if (err) return next(err);
      res.send(agents);
    });
  },

  /**
   * Get agent by 'id' param.
   */
  get: function (req, res, next) {
    res.send(req.agent);
  },

  /**
   * Create new agent.
   * Required fields: 'firstName', 'lastName' and 'percentage'
   */
  create: function (req, res, next) {
    Agent.create(req.body, function (err, agent) {
      if (err) return next(err);
      res.send(agent);
    })
  },

  /**
   * Update existing agent.
   */
  update: function (req, res, next) {
    Agent.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}, function (err, agent) {
      if (err) return next(err);
      res.send(agent);
    })
  },

  /**
   * Remove exiting agent by 'id' param.
   */
  remove: function (req, res, next) {
    Agent.findOneAndRemove({_id: req.params.id}, function (err, agent) {
      if (err) return next(err);
      res.send(agent);
    });
  }

}

module.exports = AgentsController;
