const express = require('express');
const router = express.Router();

const { Genre, validate } = require('../models/genre');

router.get('/', async (request, response) => {
  const genres = await Genre.find().sort('name').select('_id name');
  response.send(genres);
});

router.get('/:id', async (request, response) => {
  try {
    const genre = await Genre.findById(request.params.id).select('_id name');
    if (!genre) return response.status(404).send('The genre with the given ID was not found');

    response.send(genre);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.post('/', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  try {
    let genre = new Genre({ name: request.body.name });
    genre = await genre.save();
    response.send(genre);
  } catch (ex) {
    response.status(400).send(ex.message);
  }
});

router.put('/:id', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  try {
    const genre = await Genre.findByIdAndUpdate(request.params.id, { name: request.body.name }, { new: true });
    if (!genre) return response.status(404).send('The genre with the given ID was not found');

    response.send(genre);
  } catch (ex) {
    response.status(400).send(ex.message);
  }
});

router.delete('/:id', async (request, response) => {
  try {
    const genre = await Genre.findByIdAndRemove(request.params.id);
    if (!genre) return response.status(404).send('The genre with the given ID was not found');
    
    response.send(genre);
  } catch (ex) {
    response.status(400).send(ex.message);
  }
});

module.exports = router;
