const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Movie } = require('../models/movie');
const { Rental, validateRental } = require('../models/rental');

router.post('/', [auth, validate(validateRental)], async (request, response) => {
  const { customerId, movieId } = request.body;
  // const rental = await Rental.findOne({ 'customer._id': customerId, 'movie._id': movieId });
  const rental = await Rental.lookup(customerId, movieId);
  if (!rental) return response.status(404).send('The specified rental was not found');

  if (rental.dateReturned) return response.status(400).send('The specified rental was already processed.');

  rental.return();
  await Movie.update({ _id: rental.movie._id}, { 
    $inc: { numberInStock: 1 }
  });
  
  await rental.save();
  response.send(rental);
});

module.exports = router;
