const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');

router.get('/me', auth, async (request, response) => {
  const user = await User.findById(request.user._id).select('-password');
  response.send(user);
});

router.post('/', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const { name, email, password, isAdmin } = request.body;

  let user = await User.findOne({ email });
  if (user) return response.status(400).send('User already registered.');

  user = new User({ name, email, password, isAdmin });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  response.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']));
});

module.exports = router;
