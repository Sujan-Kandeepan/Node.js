const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
require('express-async-errors');
const debug = require('debug')('app:*');
const winston = require('winston');
require('winston-mongodb');
const config = require('config');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const home = require('./routes/home');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const users = require('./routes/users');
const auth = require('./routes/auth');
const error = require('./middleware/error');

// process.on('uncaughtException', (ex) => {
//   winston.error(ex.message, ex);
//   process.exit(1);
// });

process.on('unhandledRejection', (ex) => {
  // winston.error(ex.message, ex);
  // process.exit(1);
  throw ex; // exception now caught by winston
});

winston.handleExceptions(new winston.transports.File({ filename: 'uncaught-exceptions.log' }));

winston.add(winston.transports.File, { filename: 'error.log' });
winston.add(winston.transports.MongoDB, { db: 'mongodb://localhost:27017/vidly', level: 'error' });

const p = Promise.reject(new Error('Failed miserably.'));
p.then(() => console.log('Done'));

if (!config.get('jwtPrivateKey')) {
  console.log('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost:27017/vidly', { useNewUrlParser: true})
  .then(() => debug('Connected to MongoDB'))
  .catch(error => debug(error.message));

app.use(express.json());
app.use('/', home);
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
