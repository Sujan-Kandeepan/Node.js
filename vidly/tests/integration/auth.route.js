const request = require('supertest');
const jwt = require('jsonwebtoken');

const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('/api/auth', () => {
    let user, name, email, password, isAdmin;

    const execute = () => {
      return request(server)
        .post('/api/auth')
        .send({ email, password });
    };

    beforeEach(async () => {
      server = require('../../index');
      name = 'name';
      email = 'test@test.com';
      password = 'password';
      isAdmin = true;
      user = new User({ name, email, password, isAdmin });
      await request(server)
        .post('/api/users')
        .send({ name, email, password, isAdmin });
    });

    afterEach(async () => {
      await User.remove({});
      await server.close();
    });

    it('should return 400 if email is missing', async () => {
      email = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is less than 5 characters', async () => {
      email = 'abc';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is more than 250 characters', async () => {
      email = new Array(252).join('a');
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not a valid email', async () => {
      email = 'abcdefg';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      password = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is less than 5 characters', async () => {
      password = 'abc';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is more than 250 characters', async () => {
      password = new Array(252).join('a');
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if email is not found in the database', async () => {
      email = 'incorrect@email.com';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if password is incorrect', async () => {
      password = 'wrong';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 200 if the request is valid', async () => {
      const response = await execute();

      expect(response.status).toBe(200);
    });

    it('should return the user auth token if the request is valid', async () => {
      const response = await execute();

      expect(jwt.decode(response.body)).toBeDefined();
    });
  });
};
