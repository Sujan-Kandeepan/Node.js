const Joi = require('joi');
const express = require('express');
const app = express();

const home = require('./routes/home');
const genres = require('./routes/genres');

app.use(express.json());
app.use('/', home);
app.use('/api/genres', genres);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
