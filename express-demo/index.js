const Joi = require('joi');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');
const debug = require('debug')('app:startup');
const express = require('express');
const app = express();

const logger = require('./middleware/logger');
const home = require('./routes/home');
const posts = require('./routes/posts');
const courses = require('./routes/courses');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());

app.use(logger);
app.use('/', home);
app.use('/api/posts', posts);
app.use('/api/courses', courses);

app.set('view engine', 'pug');
app.set('views', './views'); // default

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  debug('Morgan enabled...'); // console.log()
}

debug(`Application name: ${config.get('name')}`);
debug(`Mail server name: ${config.get('mail.host')}`);
debug(`Mail password: ${config.get('mail.password')}`);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
