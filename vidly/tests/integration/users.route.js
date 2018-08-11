const request = require('supertest');
const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('/api/users', () => {
    beforeEach(() => {
      server = require('../../index');
    });

    afterEach(async () => {
      await User.remove({});
      await server.close();
    });

    describe('GET /me', () => {
      let user, name, email, password, isAdmin, token;

      const execute = () => {
        return request(server)
          .get('/api/users/me')
          .set('x-auth-token', token)
          .send();
      };

      beforeEach(async () => {
        name = 'name';
        email = 'test@test.com';
        password = 'password';
        isAdmin = true;
        await request(server)
          .post('/api/users')
          .send({ name, email, password, isAdmin });
        user = await User.findOne({ name });
        token = user.generateAuthToken();
        
      });

      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });

      it('should return the current user', async () => {
        const response = await execute();
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(name);
        expect(response.body.email).toBe(email);
      });
    });
  });

  describe('POST /', () => {
    let name, email, password, isAdmin;

    const execute = () => {
      return request(server)
        .post('/api/users')
        .send({ name, email, password, isAdmin });
    };

    beforeEach(async () => {
      name = 'name';
      email = 'user@test.com';
      password = 'password';
      isAdmin = true;
      await User.remove({});
    });

    it('should return 400 if user name is missing', async () => {
      name = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user name is less than 3 characters', async () => {
      name = 'a';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user name is more than 50 characters', async () => {
      name = new Array(52).join('a');
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user email is missing', async () => {
      email = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user email is less than 5 characters', async () => {
      email = 'abc';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user email is more than 250 characters', async () => {
      email = new Array(252).join('a');
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user email is not a valid email', async () => {
      email = 'abcdefg';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user password is missing', async () => {
      password = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user password is less than 5 characters', async () => {
      password = 'abc';
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user password is more than 250 characters', async () => {
      password = new Array(252).join('a');
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if user admin status is missing', async () => {
      isAdmin = null;
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if the user is already registered', async () => {
      await execute();
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return 400 if the user is already registered', async () => {
      await execute();
      const response = await execute();

      expect(response.status).toBe(400);
    });

    it('should return new user if request is valid', async () => {
      const response = await execute();

      expect(response.status).toBe(200);
    });
  });
}
