"use strict";
const registerController = require('../controllers/registersController');
const { auth } = require('../../config/auth');

module.exports = function(app){
  app.get('/registers', auth.authenticate, registerController.list);
  app.delete('/registers/:id', auth.authenticate, registerController.removeById);
};