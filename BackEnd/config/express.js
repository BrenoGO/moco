"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const { auth } = require('./auth');
const routesAccounts = require('../app/routes/accountRoutes');
const routesRegisters = require('../app/routes/registerRoutes');
const routesUsers = require('../app/routes/userRoutes');

module.exports = function(){
  const app = express();
  app.set('port', 3000);

  app.use(bodyParser.json());
  app.use(cors());
  app.use(auth.initialize());

  routesAccounts(app);
  routesRegisters(app);
  routesUsers(app);
  
  return app;
};