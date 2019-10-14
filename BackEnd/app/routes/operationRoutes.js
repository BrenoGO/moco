const operationController = require('../controllers/operationController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/operations/:id', auth.authenticate, operationController.index);
  app.get('/operations', auth.authenticate, operationController.all);
  app.post('/operations', auth.authenticate, operationController.store);
  app.delete('/operations/clearAll', auth.authenticate, operationController.clearAll);
  app.delete('/operations/:id', auth.authenticate, operationController.delete);
  return app;
};
