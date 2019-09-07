const mongoose = require('mongoose');

const { Mixed, ObjectId } = mongoose.Schema.Types;

const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    index: {
      unique: true
    }
  },
  data: Mixed
});

module.exports = mongoose.model('Setting', schema);
