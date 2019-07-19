"use strict";
const mongoose = require('mongoose');

module.exports = function (url) {
  mongoose.connect(url, {useNewUrlParser: true, useFindAndModify: false});
  mongoose.connection.on('connected', () => {console.log('Mongoose connected');});
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose was closed');
        process.exit(0);
    });
  });
}