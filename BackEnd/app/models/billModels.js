const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const schema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  value: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  emitDate: {
    type: Date,
    required: true
  },
  operation: {
    type: ObjectId,
    required: true,
    ref: 'Operation'
  },
  description: String,
  installment: String,
  note: String
},
{
  timestamps: true
});

module.exports = mongoose.model('Bill', schema);
