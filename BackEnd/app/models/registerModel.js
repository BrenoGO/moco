const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const whereSchema = mongoose.Schema({
  accountId: {
    type: ObjectId,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  balance: Number,
  bills: {
    type: [ObjectId],
    ref: 'Bill'
  }
});
const whatSchema = mongoose.Schema({
  accountId: {
    type: ObjectId,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  description: String
});

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
  whereAccount: [whereSchema],
  whatAccount: [whatSchema],
  description: String,
  note: String
},
{
  timestamps: true
});

module.exports = mongoose.model('Register', RegisterSchema);
