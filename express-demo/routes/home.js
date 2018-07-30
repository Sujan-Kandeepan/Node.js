const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  response.render('index', { title: 'My Express App', message: 'Hello world!' });
});

module.exports = router;
