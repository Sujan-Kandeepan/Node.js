const Joi = require('joi');
const moment = require('moment');
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
    default: Date.now()
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function(customerId, movieId) {
  return this.findOne({ 'customer._id': customerId, 'movie._id': movieId });
};

rentalSchema.methods.return = function() {
  this.dateReturned = Date.now();
  this.rentalFee = moment().diff(this.dateOut, 'days') * this.movie.dailyRentalRate;
};

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
