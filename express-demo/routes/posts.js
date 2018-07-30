const express = require('express');
const router = express.Router();

router.get('/:year/:month', (request, response) => {
  response.send({ params: request.params, query: request.query });
});

module.exports = router;