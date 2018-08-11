const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const { Rental } = require('../../models/rental');

let server;

module.exports = function() {
  describe('/api/returns', () => {
    let rental, movie, customerId, movieId, token;
  
    const execute = () => {
      return request(server)
        .post('/api/returns')
        .set('x-auth-token', token)
        .send({ customerId, movieId });; 
    };
  
    beforeEach(async () => {
      server = require('../../index');
      token = new User().generateAuthToken();
      customerId = mongoose.Types.ObjectId();
      movieId = mongoose.Types.ObjectId();

      movie = new Movie({
        _id: movieId,
        title: 'movie title',
        genre: new Genre({ name: 'genre1' }),
        numberInStock: 3,
        dailyRentalRate: 5
      });
      await movie.save();
  
      rental = new Rental({
        customer: {
          _id: customerId,
          name: '12345',
          phone: '12345'
        },
        movie: movie
      });
      await rental.save();
    });
  
    afterEach(async () => {
      await Rental.remove({});
      await Movie.remove({});
      await server.close();
    });
  
    it('should return 401 if client is not logged in', async () => {
      token = '';
      const response = await execute();
      
      expect(response.status).toBe(401);
    });

    it('should return 400 if customerId is not provided', async () => {
      customerId = '';
      const response = await execute();
      
      expect(response.status).toBe(400);
    });

    it('should return 400 if movieId is not provided', async () => {
      movieId = '';
      const response = await execute();
      
      expect(response.status).toBe(400);
    });

    it('should return 404 if no rental with the given ID was found', async () => {
      await Rental.remove({});
      const response = await execute();
      
      expect(response.status).toBe(404);
    });

    it('should return 400 if the specified rental was already processed', async () => {
      rental.dateReturned = Date.now();
      await rental.save({});
      const response = await execute();
      
      expect(response.status).toBe(400);
    });

    it('should return 200 if the request is valid', async () => {
      const response = await execute();
      
      expect(response.status).toBe(200);
    });

    it('should return the rental if the request is valid', async () => {
      const response = await execute();
      
      expect(Object.keys(response.body)).toEqual(
        expect.arrayContaining(['customer', 'movie', 'dateOut', 'dateReturned', 'rentalFee'])
      );
    });

    it('should set the return date if request is valid', async () => {
      await execute();
  
      const rentalInDB = await Rental.findById(rental._id);
      const diff = Date.now() - rentalInDB.dateReturned;
      expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set the rental fee if request is valid', async () => {
      rental.dateOut = moment().add(-7, 'days').toDate();
      await rental.save();
      await execute();
  
      const rentalInDB = await Rental.findById(rental._id);
      expect(rentalInDB.rentalFee).toBe(rental.movie.dailyRentalRate * 7);
    });

    it('should increment the movie stock if request is valid', async () => {
      await execute();
  
      const movieInDB = await Movie.findById(movieId);
      expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
    });
  });
};
