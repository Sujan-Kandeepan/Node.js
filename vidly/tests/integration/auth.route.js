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
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if email is less than 5 characters', async () => {
      email = 'abc';
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if email is more than 250 characters', async () => {
      email = new Array(252).join('a');
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if email is not a valid email', async () => {
      email = 'abcdefg';
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if password is missing', async () => {
      password = null;
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if password is less than 5 characters', async () => {
      password = 'abc';
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if password is more than 250 characters', async () => {
      password = new Array(252).join('a');
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if email is not found in the database', async () => {
      email = 'incorrect@email.com';
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 400 if password is incorrect', async () => {
      password = 'wrong';
      const result = await execute();

      expect(result.status).toBe(400);
    });

    it('should return 200 if the request is valid', async () => {
      const result = await execute();

      expect(result.status).toBe(200);
    });

    it('should return the user auth token if the request is valid', async () => {
      const result = await execute();

      expect(jwt.decode(result.body)).toBeDefined();
    });
  });
};
