const controllerAccounts = require('../controllers/accountsController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/accounts', auth.authenticate, controllerAccounts.index);
  app.post('/accounts', auth.authenticate, controllerAccounts.insert);
  app.put('/accounts/:id', auth.authenticate, controllerAccounts.update);
  app.post('/accounts/initialAccounts', auth.authenticate, controllerAccounts.initialAccounts);
  app.delete('/accounts/clearAll', controllerAccounts.clearAll);
  app.delete('/accounts/:id', auth.authenticate, controllerAccounts.removeByID);
  return app;
};
