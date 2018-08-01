const Joi = require('joi');
const mongoose = require('mongoose');

const { customerSchema } = require('./customer');
const { movieSchema } = require('./movie');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: customerSchema,
    required: true
  },
  movie: {
    type: movieSchema,
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.rentalSchema = rentalSchema;
exports.validate = validateRental;