const operationController = require('../controllers/operationController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/operations/:id', auth.authenticate, operationController.index);
  app.get('/operations', auth.authenticate, operationController.all);
  app.post('/operations/search', auth.authenticate, operationController.search);
  app.post('/operations', auth.authenticate, operationController.store);
  app.delete('/operations/clearAll', auth.authenticate, operationController.clearAll);
  app.delete('/operations/:id', auth.authenticate, operationController.delete);
  app.delete('/operations/:id/complete', auth.authenticate, operationController.removeOperation);
  app.post('/operations/international', auth.authenticate, operationController.international);
  app.post('/operations/transfer', auth.authenticate, operationController.transfer);
  app.post('/operations/future', auth.authenticate, operationController.future);
  return app;
};
