const Joi = require('joi');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const { User } = require('../models/user');

router.post('/', async (request, response) => {
  try {
    const { error } = validate(request.body);
    if (error) return response.status(404).send(error.details[0].message);

    const { name, email, password } = request.body;

    let user = await User.findOne({ email });
    if (!user) return response.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(request.body.password, user.password);
    if (!validPassword) return response.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    response.send(token);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

function validate(request) {
  const schema = {
    email: Joi.string().min(5).max(250).required().email(),
    password: Joi.string().min(5).max(250).required()
  };

  return Joi.validate(request, schema);
}

module.exports = router;
