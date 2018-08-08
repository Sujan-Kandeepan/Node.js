const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const validate = require('../middleware/validate');
const { User } = require('../models/user');

router.post('/', validate(validateUser), async (request, response) => {
  let user = await User.findOne({ email: request.body.email });
  if (!user) return response.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(request.body.password, user.password);
  if (!validPassword) return response.status(400).send('Invalid email or password.');

  const token = user.generateAuthToken();
  response.send(token);
});

function validateUser(request) {
  const schema = {
    email: Joi.string().min(5).max(250).required().email(),
    password: Joi.string().min(5).max(250).required()
  };

  return Joi.validate(request, schema);
}

module.exports = router;
