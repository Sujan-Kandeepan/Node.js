const express = require('express');
const router = express.Router();

const { Customer, validate } = require('../models/customer');

router.get('/', async (request, response) => {
  const customers = await Customer.find().sort('name').select('_id name phone isGold');
  response.send(customers);
});

router.get('/:id', async (request, response) => {
  try {
    const customer = await Customer.findById(request.params.id).select('_id name phone isGold');
    if (!customer) return response.status(404).send('The customer with the given ID was not found.');

    response.send(customer);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.post('/', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  try {
    const { name, phone, isGold } = request.body;
    let customer = new Customer({ name, phone, isGold });

    customer = await customer.save();
    response.send(customer);
  } catch (ex) {
    response.status(400).send(ex.message);
  }
});

router.put('/:id', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  try {
    const { name, phone, isGold } = request.body;

    const customer = await Customer.findByIdAndUpdate(request.params.id, { name, phone, isGold }, { new: true });
    if (!customer) return response.status(404).send('The customer with the given ID was not found.');

    response.send(customer);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.delete('/:id', async(request, response) => {
  try {
    const customer = await Customer.findByIdAndRemove(request.params.id);
    if (!customer) return response.status(404).send('The customer with the given ID was not found.');

    response.send(customer);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

module.exports = router;
