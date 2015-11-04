var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Agent model.
 * Represents a payments collection agent.
 * Every agent is given a specified percentage from the total collected.
 *
 * @exports models/Agent
 * @type {Object}
 */
var AgentSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  percentage: {type: Number, required: true},
});

module.exports = mongoose.model('Agent', AgentSchema);

