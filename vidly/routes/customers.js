const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const { Customer, validate } = require('../models/customer');

router.get('/', async (request, response) => {
  const customers = await Customer.find().sort('name').select('_id name phone isGold');
  response.send(customers);
});

router.get('/:id', validateObjectId, async (request, response) => {
  const customer = await Customer.findById(request.params.id).select('_id name phone isGold');
  if (!customer) return response.status(404).send('The customer with the given ID was not found.');

  response.send(customer);
});

router.post('/', auth, async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const { name, phone, isGold } = request.body;
  const customer = new Customer({ name, phone, isGold });

  await customer.save();
  response.send(customer);
});

router.put('/:id', [auth, validateObjectId], async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const { name, phone, isGold } = request.body;

  const customer = await Customer.findByIdAndUpdate(request.params.id, { name, phone, isGold }, { new: true });
  if (!customer) return response.status(404).send('The customer with the given ID was not found.');

  response.send(customer);
});

router.delete('/:id', [auth, admin, validateObjectId], async(request, response) => {
  const customer = await Customer.findByIdAndRemove(request.params.id);
  if (!customer) return response.status(404).send('The customer with the given ID was not found.');

  response.send(customer);
});

module.exports = router;
