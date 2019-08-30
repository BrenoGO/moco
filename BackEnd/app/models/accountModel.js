const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const accountSchema = mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  allowValue: {
    type: Boolean,
    default: false
  },
  parents: {
    type: [ObjectId],
    default: []
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
