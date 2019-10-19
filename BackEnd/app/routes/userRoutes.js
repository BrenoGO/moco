const userController = require('../controllers/userController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/users', userController.listUsers);
  app.get('/users/:id', auth.authenticate, userController.userById);
  app.post('/users', userController.signUp);
  app.post('/users/login', userController.login);
  app.put('/users/update', auth.authenticate, userController.update);
  app.delete('/users/clearAll', userController.clearAll);
  app.delete('/users/:id', auth.authenticate, userController.removeUser);
  return app;
};
