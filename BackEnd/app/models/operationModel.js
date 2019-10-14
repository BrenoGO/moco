const { Schema, model } = require('mongoose');

const { ObjectId } = Schema.Types;

const schema = Schema({
  registers: {
    type: [ObjectId],
    ref: 'Register'
  },
  bills: {
    type: [ObjectId],
    ref: 'Bill'
  },
  emitDate: Date,
  description: String,
  notes: String
}, {
  timestamps: true
});

module.exports = model('Operation', schema);
