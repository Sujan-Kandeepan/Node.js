const debug = require('debug')('app:*');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const home = require('./routes/home');
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');

mongoose.connect('mongodb://localhost:27017/vidly', { useNewUrlParser: true})
  .then(() => debug('Connected to MongoDB'))
  .catch(error => debug(error.message));

app.use(express.json());
app.use('/', home);
app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
