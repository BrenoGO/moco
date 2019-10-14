const settingsController = require('../controllers/settingsController');
const { auth } = require('../../config/auth');

module.exports = (app) => {
  app.get('/settings/defaults', auth.authenticate, settingsController.getDefaults);
  app.get('/settings', auth.authenticate, settingsController.index);
  app.post('/settings/initialSettings', auth.authenticate, settingsController.initialSettings);
  app.post('/settings', auth.authenticate, settingsController.store);
  app.put('/settings/:name', auth.authenticate, settingsController.update);
  app.delete('/settings/clearAll', auth.authenticate, settingsController.clearAll);
};
