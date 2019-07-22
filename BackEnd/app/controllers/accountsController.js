"use strict";
const accountsModal = require('../models/accountsModel');

module.exports = {
  index: async (req, res) => {
    const accounts = await accountsModal.find();
    return res.json(accounts);
  },
  findByParent: async (req, res) => {
    const { parent } = req.params;
    const activeQuery = req.query.active;
    let accounts = [];
    console.log(activeQuery);
    if(activeQuery){ // foi passado active na query string

      if(activeQuery === 'false'){ // active==false
        const active = false;
        accounts = await accountsModal.find({parents: parent, active}, 'name');

      }else if(activeQuery === 'true'){ //active == true
        const active = true;
        accounts = await accountsModal.find({parents: parent, active}, 'name');

      }else if(activeQuery === 'all'){ //active == all
        accounts = await accountsModal.find({parents: parent}, {name: true, active:true });
      }
    }else{ // nao foi passado active, achar apenas os ativos..
      const active = true;
      accounts = await accountsModal.find({parents: parent, active}, 'name');
    }
    
    return res.json(accounts);
  },
  insert: async (req, res) => {
    const account = await accountsModal.create(req.body);
    return res.json(account);
  },
  removeByID: (req, res) => {
    const { id } = req.params;
    accountsModal.findByIdAndDelete(id, (err) => {
      if(err){
        return res.send({
          naoOk:'nao foi removido',
          err
        });
      }
      return res.send({ok:'ok'});
    });  
  }
};