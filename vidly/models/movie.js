const Joi = require('joi');
const mongoose = require('mongoose');

const { genreSchema } = require('./genre');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 250
  },
  genre: {
    type: genreSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 250
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 250
  }
});

const Movie = mongoose.model('Movie', movieSchema);

function validateMovie(movie) {
  const schema = {
    title: Joi.string().min(1).max(250).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(250).required(),
    dailyRentalRate: Joi.number().min(0).max(250).required()
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.movieSchema = movieSchema;
exports.validate = validateMovie;
