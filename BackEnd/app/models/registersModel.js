const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const schema = mongoose.Schema({
  description:{
    type: String,
    required: true
  },
  accountId: {
    type: ObjectId,
    required: true
  },
  registerDate:{
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Register', schema);