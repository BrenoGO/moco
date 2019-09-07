const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const RegisterSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  opType: {
    type: String,
    required: true,
    enum: [
      'expenseAtSight', //  where is a current
      'incomeAtSight', //  where is a current
      'expenseToPay', // where is a future.. generates a bill
      'incomeToReceive', // where is a future.. generates a bill
      'transference'
    ]
  },
  emitDate: {
    type: Date,
    default: Date.now
  },
  whereAccountId: Number,
  whereAccountBalance: Number,
  whatAccountId: Number,
  description: String,
  notes: String,
  value: {
    type: Number,
    required: true
  },
  bills: {
    type: [ObjectId],
    ref: 'Bill'
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Register', RegisterSchema);
