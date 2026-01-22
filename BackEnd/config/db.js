const mongoose = require('mongoose');

module.exports = function (url) {
  mongoose.connect(url, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  mongoose.connection.on('connected', () => { console.log('Mongoose connected'); });
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('Mongoose was closed');
      process.exit(0);
    });
  });
};
