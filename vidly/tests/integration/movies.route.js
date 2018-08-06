const request = require('supertest');
const mongoose = require('mongoose');

const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('/api/movies', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
      await Movie.remove({});
      await Genre.remove({});
      await server.close();
    });

    describe('GET /', () => {
      it('should return all movies', async () => {
        await Genre.collection.insertMany([
          { name: 'genre1' },
          { name: 'genre2' }
        ]);

        const genre1 = await Genre.findOne({ name: 'genre1' });
        const genre2 = await Genre.findOne({ name: 'genre2' });

        await Movie.collection.insertMany([
          { title: 'movie1', genre: genre1, numberInStock: 1, dailyRentalRate: 1 },
          { title: 'movie2', genre: genre2, numberInStock: 2, dailyRentalRate: 2 }
        ]);
  
        const response = await request(server).get('/api/movies');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.some(m => m.title === 'movie1')).toBeTruthy();
        expect(response.body.some(m => m.title === 'movie2')).toBeTruthy();
        expect(response.body.some(m => m.genre.name === 'genre1')).toBeTruthy();
        expect(response.body.some(m => m.genre.name === 'genre2')).toBeTruthy();
        expect(response.body.some(m => m.numberInStock === 1)).toBeTruthy();
        expect(response.body.some(m => m.numberInStock === 2)).toBeTruthy();
        expect(response.body.some(m => m.dailyRentalRate === 1)).toBeTruthy();
        expect(response.body.some(m => m.dailyRentalRate === 2)).toBeTruthy();
      });
    });

    describe('GET /:id', () => {
      it('should return a movie if valid ID is passed', async () => {
        let genre = new Genre({ name: 'genre' });
        await genre.save();
        genre = await Genre.findOne({ name: 'genre' });

        const movie = new Movie({ title: 'movie', genre, numberInStock: 1, dailyRentalRate: 1 });
        await movie.save();
  
        const response = await request(server).get('/api/movies/' + movie._id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', movie.name);
      });
  
      it('should return 404 if invalid ID is passed', async () => {
        const response = await request(server).get('/api/movies/1');
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no movie with the given ID exists', async () => {
        const response = await request(server).get('/api/movies/' + mongoose.Types.ObjectId());
        expect(response.status).toBe(404);
      });
    });

    describe('POST /', () => {
      let token, title, genre, genreId, numberInStock, dailyRentalRate;
  
      const execute = () => {
        return request(server)
          .post('/api/movies')
          .set('x-auth-token', token)
          .send({ title, genreId, numberInStock, dailyRentalRate });
      };
  
      beforeEach(async () => {
        token = new User().generateAuthToken();
        title = 'movie';
        genre = new Genre({ name: 'genre' });
        await genre.save();
        genre = await Genre.findOne({ name: 'genre' });
        genreId = genre._id
        numberInStock = 1;
        dailyRentalRate = 1;
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });

      it('should return 400 if title is missing', async () => {
        title = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if title is empty', async () => {
        title = '';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if title is more than 250 characters', async () => {
        title = new Array(252).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if genre ID is invalid', async () => {
        genreId = 1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 404 if no genre with the given ID was found', async () => {
        genreId = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });

      it('should return 400 if number in stock is missing', async () => {
        numberInStock = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if number in stock is negative', async () => {
        numberInStock = -1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if number in stock is more than 250', async () => {
        numberInStock = 251;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if daily rental rate is missing', async () => {
        dailyRentalRate = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if daily rental rate is negative', async () => {
        dailyRentalRate = -1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if daily rental rate is more than 250', async () => {
        dailyRentalRate = 251;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should save the movie if it is valid', async () => {
        const response = await execute();
  
        const movie = await Movie.find({ title });
        expect(response.status).toBe(200);
        expect(movie).not.toBe(null);
      });
  
      it('should return the movie if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('title', title);
        expect(response.body).toHaveProperty('genre');
        expect(response.body.genre).toHaveProperty('name', genre.name);
        expect(response.body).toHaveProperty('numberInStock', numberInStock);
        expect(response.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
      });
    });

    describe('PUT /:id', () => {
      let movie, token, title, genre, genreId, numberInStock, dailyRentalRate, id;
  
      const execute = () => {
        return request(server)
          .put('/api/movies/' + id)
          .set('x-auth-token', token)
          .send({ title, genreId, numberInStock, dailyRentalRate });
      };
  
      beforeEach(async () => {
        genre = new Genre({ name: 'genre1' });
        await genre.save();
        genre = await Genre.findOne({ name: 'genre1' });

        movie = new Movie({ title: 'movie1', genre, numberInStock: 1, dailyRentalRate: 1 });
        await movie.save();
        movie = await Movie.findOne({ title: 'movie1' });

        genre = new Genre({ name: 'genre2' });
        await genre.save();
        genre = await Genre.findOne({ name: 'genre2' });

        token = new User().generateAuthToken();
        title = 'movie2';
        genreId = genre._id;
        numberInStock = 2;
        dailyRentalRate = 2;
        id = movie._id;
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 400 if title is missing', async () => {
        title = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if title is empty', async () => {
        title = '';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if title is more than 250 characters', async () => {
        title = new Array(252).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if genre ID is invalid', async () => {
        genreId = 1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 404 if no genre with the given ID was found', async () => {
        genreId = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });

      it('should return 400 if number in stock is missing', async () => {
        numberInStock = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if number in stock is negative', async () => {
        numberInStock = -1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if number in stock is more than 250', async () => {
        numberInStock = 251;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if daily rental rate is missing', async () => {
        dailyRentalRate = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if daily rental rate is negative', async () => {
        dailyRentalRate = -1;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if daily rental rate is more than 250', async () => {
        dailyRentalRate = 251;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 404 if ID is invalid', async () => {
        id = 1;
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no movie with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should save the movie if it is valid', async () => {
        const response = await execute();
  
        const received = await Movie.findById(movie._id);
        expect(response.status).toBe(200);
        expect(received).not.toBe(null);
      });
  
      it('should return the movie if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('title', title);
        expect(response.body).toHaveProperty('genre');
        expect(response.body.genre).toHaveProperty('name', genre.name);
        expect(response.body).toHaveProperty('numberInStock', numberInStock);
        expect(response.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
      });
    });

    describe('DELETE /:id', () => {
      let movie, genre, token, id;
  
      const execute = () => {
        return request(server)
          .delete('/api/movies/' + id)
          .set('x-auth-token', token)
          .send();
      };
  
      beforeEach(async () => {
        genre = new Genre({ name: 'genre' });
        await genre.save();
        genre = await Genre.findOne({ name: 'genre' });

        movie = new Movie({ title: 'movie', genre, numberInStock: 1, dailyRentalRate: 1 });
        await movie.save();
        movie = await Movie.findOne({ title: 'movie' });

        token = new User({ isAdmin: true }).generateAuthToken();
        title = 'movie';
        genreId = genre._id;
        numberInStock = 1;
        dailyRentalRate = 1;
        id = movie._id;
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 403 if client is not an admin', async () => {
        token = new User().generateAuthToken({ isAdmin: true });
        const response = await execute();
  
        expect(response.status).toBe(403);
      });
  
      it('should return 404 if ID is invalid', async () => {
        id = 1;
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no movie with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should delete the movie if it is valid', async () => {
        const response = await execute();
  
        const received = await Movie.findById(movie._id);
        expect(response.status).toBe(200);
        expect(received).toBe(null);
      });
  
      it('should return the movie if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('title', title);
        expect(response.body).toHaveProperty('genre');
        expect(response.body.genre).toHaveProperty('name', genre.name);
        expect(response.body).toHaveProperty('numberInStock', numberInStock);
        expect(response.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
      });
    });
  });
}
