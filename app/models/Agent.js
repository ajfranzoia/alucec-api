var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AgentSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  percentage: {type: Number, required: true},
});

module.exports = mongoose.model('Agent', AgentSchema);

