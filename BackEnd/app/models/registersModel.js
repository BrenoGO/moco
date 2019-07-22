"use strict";
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
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Register', schema);