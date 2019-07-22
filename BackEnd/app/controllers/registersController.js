"use strict";
const registerModel = require('../models/registersModel');

module.exports = {
  list: async (req, res) => {
    const registers = await registerModel.find({},null,{sort:{registerDate: 1}});
    return res.json(registers);
  },
  registerEvent: async (req, res) => {
    const register = await registerModel.create(req.body);
    return res.json(register);
  },
  removeById: (req, res) => {
    const { id } = req.params;
    registerModel.findByIdAndDelete(id, err => {
      if(err){
        return res.send({err});
      }
      return res.send({ok:'Register deleted'});
    });
  }
};