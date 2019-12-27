const billsController = require('../controllers/billsController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/bills/id/:id', auth.authenticate, billsController.index);
  app.get('/bills/:type', auth.authenticate, billsController.byType);
  app.get('/bills', auth.authenticate, billsController.all);
  app.post('/bills/search', auth.authenticate, billsController.search);
  app.post('/bills', auth.authenticate, billsController.store);
  app.put('/bills/pay/:id', auth.authenticate, billsController.pay);
  app.put('/bills/:id', auth.authenticate, billsController.update);
  app.delete('/bills/clearAll', auth.authenticate, billsController.clearAll);
  app.delete('/bills/:id', auth.authenticate, billsController.delete);
};
