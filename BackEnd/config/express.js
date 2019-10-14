const express = require('express');
const cors = require('cors');

const { auth } = require('./auth');
const routes = require('../app/routes');

module.exports = function () {
  const app = express();
  app.set('port', process.env.PORT || 3001);

  app.use(express.json());
  app.use(cors());
  app.use(auth.initialize());

  routes(app);

  return app;
};
