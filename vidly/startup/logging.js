const winston = require('winston');
require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
  // process.on('uncaughtException', (ex) => {
  //   winston.error(ex.message, ex);
  //   process.exit(1);
  // });

  process.on('unhandledRejection', (ex) => {
    // winston.error(ex.message, ex);
    // process.exit(1);
    throw ex; // exception now caught by winston
  });

  winston.handleExceptions(
    new winston.transports.File({ filename: 'uncaught-exceptions.log' }),
    new winston.transports.Console({ colorize: true, prettyPrint: true })
  );

  winston.add(winston.transports.File, { filename: 'error.log' });
  winston.add(winston.transports.MongoDB, { db: 'mongodb://localhost:27017/vidly', level: 'error' });
}
