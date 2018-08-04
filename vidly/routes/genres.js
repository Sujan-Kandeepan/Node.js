const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');
const { Genre, validate } = require('../models/genre');

router.get('/', async (request, response) => {
  const genres = await Genre.find().sort('name').select('_id name');
  response.send(genres);
});

router.get('/:id', validateObjectId, async (request, response) => {
  const genre = await Genre.findById(request.params.id).select('_id name');
  if (!genre) return response.status(404).send('The genre with the given ID was not found');

  response.send(genre);
});

router.post('/', auth, async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const genre = new Genre({ name: request.body.name });
  await genre.save();
  response.send(genre);
});

router.put('/:id', [auth, validateObjectId], async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(request.params.id, { name: request.body.name }, { new: true });
  if (!genre) return response.status(404).send('The genre with the given ID was not found');

  response.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async (request, response) => {
  const genre = await Genre.findByIdAndRemove(request.params.id);
  if (!genre) return response.status(404).send('The genre with the given ID was not found');
  
  response.send(genre);
});

module.exports = router;
