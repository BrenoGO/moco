"use strict";
const userController = require('../controllers/userController');

module.exports = function(app) {
  app.get('/users', userController.listUsers);
  app.get('/users/:id', userController.userById);
  app.post('/users', userController.addUser);
  app.post('/users/login', userController.login);
  app.delete('/users/:id', userController.removeUser);
  return app;
};