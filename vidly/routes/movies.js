const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { Movie, validate } = require('../models/movie');
const { Genre } = require('../models/genre');

router.get('/', async (request, response) => {
  const movies = await Movie.find().sort('name');
  response.send(movies);
});

router.get('/:id', async (request, response) => {
  try {
    const movie = await Movie.findById(request.params.id);
    if (!movie) return response.status(404).send('The movie with the given ID was not found.');

    response.send(movie);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.post('/', auth, async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  let genre = await Genre.findById(request.body.genreId);
  if (!genre) return response.status(404).send('The genre with the given ID was not found.');

  try {
    const { title, numberInStock, dailyRentalRate } = request.body;
    const { _id, name } = genre;
    const movie = new Movie({ title, genre: { _id, name }, numberInStock, dailyRentalRate });

    await movie.save();
    response.send(movie);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.put('/:id', auth, async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  let genre = await Genre.findById(request.body.genreId);
  if (!genre) return response.status(404).send('The genre with the given ID was not found.');

  try {
    const { title, numberInStock, dailyRentalRate } = request.body;
    const { _id, name } = genre;

    const movie = await Movie.findByIdAndUpdate(request.params.id, { title, genre: { _id, name }, numberInStock, dailyRentalRate }, { new: true });
    if (!movie) return response.status(404).send('The movie with the given ID was not found.');

    response.send(movie);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

router.delete('/:id', [auth, admin], async (request, response) => {
  try {
    const movie = await Movie.findByIdAndRemove(request.params.id);
    if (!movie) return response.status(404).send('The movie with the given ID was not found.');

    response.send(movie);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

module.exports = router;