"use strict";
const controllerAccounts = require('../controllers/accountsController');
const { auth } = require('../../config/auth');

module.exports = function(app){
  app.get('/accounts', auth.authenticate, controllerAccounts.index);
  app.get('/accounts/:parent', auth.authenticate, controllerAccounts.findByParent);
  app.post('/accounts', auth.authenticate, controllerAccounts.insert);
  app.delete('/accounts/:id', auth.authenticate, controllerAccounts.removeByID);
  return app;
};