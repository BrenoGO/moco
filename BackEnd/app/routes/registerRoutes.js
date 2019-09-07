const registerController = require('../controllers/registersController');
const { auth } = require('../../config/auth');

module.exports = function (app) {
  app.get('/registers', auth.authenticate, registerController.index);
  app.post('/registers/search', auth.authenticate, registerController.search);
  app.post('/registers/sum', auth.authenticate, registerController.sumWhatAccount);
  app.post('/registers', auth.authenticate, registerController.store);
  app.delete('/registers/:id', auth.authenticate, registerController.removeById);
};
