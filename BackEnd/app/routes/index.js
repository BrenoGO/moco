const accountRoutes = require('./accountRoutes');
const settingRoutes = require('./settingRoutes');
const userRoutes = require('./userRoutes');
const registerRoutes = require('./registerRoutes');
const reportsRoutes = require('./reportsRoutes');
const operationRoutes = require('./operationRoutes');
const billRoutes = require('./billRoutes');

module.exports = function (app) {
  accountRoutes(app);
  settingRoutes(app);
  userRoutes(app);
  registerRoutes(app);
  reportsRoutes(app);
  operationRoutes(app);
  billRoutes(app);
};
