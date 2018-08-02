const Fawn = require('fawn');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');

Fawn.init(mongoose);

router.get('/', async (request, response) => {
  const rentals = await Rental.find().sort('-dateOut');
  response.send(rentals);
});

router.post('/', async (request, response) => {
  const { error } = validate(request.body);
  if (error) return response.status(400).send(error.details[0].message);

  let customer = await Customer.findById(request.body.customerId);
  if (!customer) return response.status(404).send('The customer with the given ID was not found.');

  let movie = await Movie.findById(request.body.movieId);
  if (!movie) return response.status(404).send('The movie with the given ID was not found.');

  if (movie.numberInStock === 0) return response.status(400).send('The movie with the given ID is out of stock.');

  customer = {
    _id: customer._id,
    name: customer.name,
    phone: customer.phone
  };

  movie = {
    _id: movie._id,
    title: movie.title,
    dailyRentalRate: movie.dailyRentalRate
  };

  let rental = new Rental({ customer, movie });
  
  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
      })
      .run();

    response.send(rental);
  } catch (ex) {
    return response.status(400).send(ex.message);
  }
});

module.exports = router;