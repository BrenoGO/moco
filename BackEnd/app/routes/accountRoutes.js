const controllerAccounts = require('../controllers/accountsController');

module.exports = function(app){
  app.get('/accounts', controllerAccounts.index);
  app.get('/accounts/:parent', controllerAccounts.findByParent);
  app.post('/accounts', controllerAccounts.insert);
  app.delete('/accounts/:id', controllerAccounts.removeByID);
  return app;
}