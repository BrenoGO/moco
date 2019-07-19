"use strict"
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const accountSchema = mongoose.Schema({
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
  registerDate: {
    type: Date,
    default: Date.now()
  },
  parents: {
    type: [ObjectId],
    default: []
  }
});

module.exports = mongoose.model('Account', accountSchema);
 

/*
const tree = {
  Gastos: {
    hierarquia: 0, 
    tipo: 'accountGroup',
    dataCadast: Date,
    filhos: [
      {
        id: 123,
        name: 'Fixos',
        hierarquia: 1,
        dataCadast: Date,
        tipo: 'conjunto de contas',
        filhos: [
          {
            id: 412314,
            name: 'Aluguel',
            hierarquia: 2,
            dataCadast: Date,
            tipo: 'conta final',
          },
          {
            id: 5123,
            name: 'Condomínio',
            hierarquia: 2,
            dataCadast: Date,
            tipo: 'conta final',
          }
        ]
      }
    ]
  },
  receitas:{

  }
}
*/