const request = require('supertest');
const mongoose = require('mongoose');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
      server.close();
      await Genre.remove({});
    });
  
    describe('GET /', () => {
      it('should return all genres', async () => {
        await Genre.collection.insertMany([
          { name: 'genre1' },
          { name: 'genre2' }
        ]);
  
        const response = await request(server).get('/api/genres');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.some(g => g.name === 'genre1')).toBeTruthy();
        expect(response.body.some(g => g.name === 'genre2')).toBeTruthy();
      });
    });
  
    describe('GET /:id', () => {
      it('should return a genre if valid ID is passed', async () => {
        const genre = new Genre({ name: 'genre1' });
        await genre.save();
  
        const response = await request(server).get('/api/genres/' + genre._id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', genre.name);
      });
  
      it('should return 404 if invalid ID is passed', async () => {
        const response = await request(server).get('/api/genres/1');
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no genre with the given ID exists', async () => {
        const response = await request(server).get('/api/genres/' + mongoose.Types.ObjectId());
        expect(response.status).toBe(404);
      });
    });
  
    describe('POST /', () => {
      let token;
      let name;
  
      const execute = () => {
        return request(server)
          .post('/api/genres')
          .set('x-auth-token', token)
          .send({ name });
      };
  
      beforeEach(() => {
        token = new User().generateAuthToken();
        name = 'genre1';
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 400 if genre is less than 5 characters', async () => {
        name = 'abc';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if genre is more than 50 characters', async () => {
        name = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should save the genre if it is valid', async () => {
        const response = await execute();
  
        const genre = await Genre.find({ name: 'genre1' });
        expect(response.status).toBe(200);
        expect(genre).not.toBe(null);
      });
  
      it('should return the genre if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', 'genre1');
      });
    });

    describe('PUT /:id', () => {
      let genre;
      let token;
      let name;
      let id;

      const execute = () => {
        return request(server)
          .put('/api/genres/' + id)
          .set('x-auth-token', token)
          .send({ name });
      };

      beforeEach(async () => {
        genre = new Genre({ name: 'genre1' });
        token = new User().generateAuthToken();
        name = 'genre2';
        id = genre._id;
        await genre.save();
      });

      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 400 if genre is less than 5 characters', async () => {
        name = 'abc';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if genre is more than 50 characters', async () => {
        name = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 404 if ID is invalid', async () => {
        id = 1;
        const response = await execute();
  
        expect(response.status).toBe(404);
      });

      it('should return 404 if no genre with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should save the genre if it is valid', async () => {
        const response = await execute();
  
        const received = await Genre.findById(genre._id);
        expect(response.status).toBe(200);
        expect(received).not.toBe(null);
      });
  
      it('should return the genre if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', name);
      });
    });

    describe('DELETE /:id', () => {
      let genre;
      let token;
      let id;

      const execute = () => {
        return request(server)
          .delete('/api/genres/' + id)
          .set('x-auth-token', token)
          .send();
      };

      beforeEach(async () => {
        genre = new Genre({ name: 'genre1' });
        token = new User({ isAdmin: true }).generateAuthToken();
        id = genre._id;
        await genre.save();
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

      it('should return 404 if no genre with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should delete the genre if it is valid', async () => {
        const response = await execute();
  
        const received = await Genre.findById(genre._id);
        expect(response.status).toBe(200);
        expect(received).toBe(null);
      });
  
      it('should return the genre if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', genre.name);
      });
    });
  });
}
