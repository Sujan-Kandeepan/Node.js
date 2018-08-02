const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

const { User, validate } = require('../models/user');

router.post('/', async (request, response) => {
  try {
    const { error } = validate(request.body);
    if (error) return response.status(404).send(error.details[0].message);

    const { name, email, password } = request.body;

    let user = await User.findOne({ email });
    if (user) return response.status(400).send('User already registered.');

    user = new User({ name, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    
    await user.save();
    response.send(_.pick(user, ['_id', 'name', 'email']));
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

module.exports = router;
