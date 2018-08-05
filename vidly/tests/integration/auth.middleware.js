const request = require('supertest');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('auth middleware', () => {
    let token;
  
    const execute = () => {
      return request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({ name: 'genre1' });
    };
  
    
    beforeEach(() => {
      server = require('../../index');
      token = new User().generateAuthToken(); 
    });
    
    afterEach(async () => {
      await server.close();
      await Genre.remove({});
    });
  
    it('should return 401 if no token is provided', async () => {
      token = '';
      const response = await execute();
  
      expect(response.status).toBe(401);
    });
  
    it('should return 400 if token is invalid', async () => {
      token = 'a';
      const response = await execute();
  
      expect(response.status).toBe(400);
    });
  
    it('should return 200 if token is valid', async () => {
      const response = await execute();
  
      expect(response.status).toBe(200);
    });
  });
};
