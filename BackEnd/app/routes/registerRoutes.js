const registerController = require('../controllers/registersController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/registers', auth.authenticate, registerController.index);
  app.post('/registers/search', auth.authenticate, registerController.search);
  app.post('/registers/incomeOrExpenseReport', auth.authenticate, registerController.incomeOrExpenseReport);
  app.post('/registers/sum', auth.authenticate, registerController.sumWhatAccount);
  app.post('/registers', auth.authenticate, registerController.store);
  app.put('/registers/:id', auth.authenticate, registerController.update);
  app.delete('/registers/clearAll', auth.authenticate, registerController.clearAll);
  app.delete('/registers/:id', auth.authenticate, registerController.removeById);
};
