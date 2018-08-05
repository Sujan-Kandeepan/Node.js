const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const validateObjectId = require('../middleware/validateObjectId');
const { Movie, validateMovie } = require('../models/movie');
const { Genre } = require('../models/genre');

router.get('/', async (request, response) => {
  const movies = await Movie.find().sort('name');
  response.send(movies);
});

router.get('/:id', validateObjectId, async (request, response) => {
  const movie = await Movie.findById(request.params.id);
  if (!movie) return response.status(404).send('The movie with the given ID was not found.');

  response.send(movie);
});

router.post('/', [auth, validate(validateMovie)], async (request, response) => {
  let genre = await Genre.findById(request.body.genreId);
  if (!genre) return response.status(404).send('The genre with the given ID was not found.');

  const { title, numberInStock, dailyRentalRate } = request.body;
  const { _id, name } = genre;
  const movie = new Movie({ title, genre: { _id, name }, numberInStock, dailyRentalRate });

  await movie.save();
  response.send(movie);
});

router.put('/:id', [auth, validateObjectId, validate(validateMovie)], async (request, response) => {
  let genre = await Genre.findById(request.body.genreId);
  if (!genre) return response.status(404).send('The genre with the given ID was not found.');

  const { title, numberInStock, dailyRentalRate } = request.body;
  const { _id, name } = genre;

  const movie = await Movie.findByIdAndUpdate(request.params.id, { title, genre: { _id, name }, numberInStock, dailyRentalRate }, { new: true });
  if (!movie) return response.status(404).send('The movie with the given ID was not found.');

  response.send(movie);
});

router.delete('/:id', [auth, admin, validateObjectId], async (request, response) => {
  const movie = await Movie.findByIdAndRemove(request.params.id);
  if (!movie) return response.status(404).send('The movie with the given ID was not found.');

  response.send(movie);
});

module.exports = router;
