const express = require('express');
const cors = require('cors');

const { auth } = require('./auth');
const routesAccounts = require('../app/routes/accountRoutes');
const routesRegisters = require('../app/routes/registerRoutes');
const routesUsers = require('../app/routes/userRoutes');
const routesSettings = require('../app/routes/settingRoutes');

module.exports = function () {
  const app = express();
  app.set('port', 3001);

  app.use(express.json());
  app.use(cors());
  app.use(auth.initialize());

  routesAccounts(app);
  routesRegisters(app);
  routesUsers(app);
  routesSettings(app);

  return app;
};
