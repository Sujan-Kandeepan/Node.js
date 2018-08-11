const request = require('supertest');
const mongoose = require('mongoose');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const { Customer } = require('../../models/customer');
const { Movie } = require('../../models/movie');
const { Rental } = require('../../models/rental');

let server;

module.exports = function() {
  describe('/api/rentals', () => {
    beforeEach(async () => { server = require('../../index'); });
    afterEach(async () => {
      await Customer.remove({});
      await Movie.remove({});
      await Rental.remove({});
      await server.close();
    });

    describe('GET /', () => {
      let customer, movie, token;

      beforeEach(async () => {
        token = new User().generateAuthToken();

        customer = new Customer({
          name: 'customer1',
          phone: '12345',
          isGold: false
        });
        await customer.save();
  
        customer = new Customer({
          name: 'customer2',
          phone: '67890',
          isGold: true
        });
        await customer.save();
  
        movie = new Movie({
          title: 'movie1',
          genre: new Genre({ name: 'genre1' }),
          numberInStock: 1,
          dailyRentalRate: 1
        });
        await movie.save();
  
        movie = new Movie({
          title: 'movie2',
          genre: new Genre({ name: 'genre2' }),
          numberInStock: 2,
          dailyRentalRate: 2
        });
        await movie.save();

        customer = await Customer.findOne({ name: 'customer1' });
        movie = await Movie.findOne({ title: 'movie1' });
        const rental1 = new Rental({ customer, movie });
        await rental1.save();

        customer = await Customer.findOne({ name: 'customer2' });
        movie = await Movie.findOne({ title: 'movie2' });
        const rental2 = new Rental({ customer, movie });
        await rental2.save();
      });

      it('should return all rentals', async () => {
        const response = await request(server)
          .get('/api/rentals')
          .set('x-auth-token', token)
          .send();

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.some(r => r.customer.name === 'customer1')).toBeTruthy();
        expect(response.body.some(r => r.customer.name === 'customer2')).toBeTruthy();
        expect(response.body.some(r => r.customer.phone === '12345')).toBeTruthy();
        expect(response.body.some(r => r.customer.phone === '67890')).toBeTruthy();
        expect(response.body.some(r => r.customer.isGold === false)).toBeTruthy();
        expect(response.body.some(r => r.customer.isGold === true)).toBeTruthy();
        expect(response.body.some(r => r.movie.title === 'movie1')).toBeTruthy();
        expect(response.body.some(r => r.movie.title === 'movie2')).toBeTruthy();
        expect(response.body.some(r => r.movie.genre.name === 'genre1')).toBeTruthy();
        expect(response.body.some(r => r.movie.genre.name === 'genre2')).toBeTruthy();
        expect(response.body.some(r => r.movie.numberInStock === 1)).toBeTruthy();
        expect(response.body.some(r => r.movie.numberInStock === 2)).toBeTruthy();
        expect(response.body.some(r => r.movie.dailyRentalRate === 1)).toBeTruthy();
        expect(response.body.some(r => r.movie.dailyRentalRate === 2)).toBeTruthy();
      });
    });

    describe('POST /', () => {
      let customer, movie, customerId, movieId, token;

      const execute = () => {
        return request(server)
          .post('/api/rentals')
          .set('x-auth-token', token)
          .send({ customerId, movieId });; 
      };

      beforeEach(async () => {
        token = new User().generateAuthToken();

        customer = new Customer({
          name: 'customer',
          phone: '12345',
          isGold: false
        });
        await customer.save();
        customer = await Customer.findOne({ name: 'customer' });
        customerId = customer._id;
  
        movie = new Movie({
          title: 'movie',
          genre: new Genre({ name: 'genre' }),
          numberInStock: 1,
          dailyRentalRate: 1
        });
        await movie.save();
        movie = await Movie.findOne({ title: 'movie' });
        movieId = movie._id;
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

      it('should return 404 if no customer with the given ID was found', async () => {
        customerId = mongoose.Types.ObjectId();
        const response = await execute();
        
        expect(response.status).toBe(404);
      });
  
      it('should return 400 if movieId is not provided', async () => {
        movieId = '';
        const response = await execute();
        
        expect(response.status).toBe(400);
      });
  
      it('should return 404 if no movie with the given ID was found', async () => {
        movieId = mongoose.Types.ObjectId();
        const response = await execute();
        
        expect(response.status).toBe(404);
      });

      it('should return 400 if the movie is out of stock', async () => {
        movie.numberInStock = 0;
        await movie.save();
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
          expect.arrayContaining(['customer', 'movie', 'dateOut'])
        );
      });

      it('should decrement the movie stock if request is valid', async () => {
        await execute();
    
        const movieInDB = await Movie.findById(movieId);
        expect(movieInDB.numberInStock).toBe(movie.numberInStock - 1);
      });
    });
  });
};
