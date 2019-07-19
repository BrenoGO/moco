const registerController = require('../controllers/registersController');

module.exports = function(app){
  app.get('/registers', registerController.list);
  app.delete('/registers/:id', registerController.removeById);
}