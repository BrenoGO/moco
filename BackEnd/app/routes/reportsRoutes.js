const reportsController = require('../controllers/reportsController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.post('/reports/incomeOrExpense', auth.authenticate, reportsController.incomeOrExpense);
  app.get('/reports/cashFlow', auth.authenticate, reportsController.cashFlow);
  app.get('/reports/general', auth.authenticate, reportsController.general);
};
