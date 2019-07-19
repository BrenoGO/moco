const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const routesAccounts = require('../app/routes/accountRoutes');
const routesRegisters = require('../app/routes/registerRoutes');

module.exports = function(){
  const app = express();
  app.set('port', 3000);

  app.use(bodyParser.json());
  app.use(cors());
  
  routesAccounts(app);
  routesRegisters(app);
  

  return app;
}