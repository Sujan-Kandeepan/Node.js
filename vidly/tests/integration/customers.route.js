const request = require('supertest');
const mongoose = require('mongoose');

const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

let server;

module.exports = function() {
  describe('/api/customers', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach(async () => {
      await Customer.remove({});
      await server.close();
    });

    describe('GET /', () => {
      it('should return all customers', async () => {
        await Customer.collection.insertMany([
          { name: 'customer1', phone: '12345', isGold: false },
          { name: 'customer2', phone: '67890', isGold: true }
        ]);
  
        const response = await request(server).get('/api/customers');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body.some(c => c.name === 'customer1')).toBeTruthy();
        expect(response.body.some(c => c.name === 'customer2')).toBeTruthy();
        expect(response.body.some(c => c.phone === '12345')).toBeTruthy();
        expect(response.body.some(c => c.phone === '67890')).toBeTruthy();
        expect(response.body.some(c => c.isGold === false)).toBeTruthy();
        expect(response.body.some(c => c.isGold === true)).toBeTruthy();
      });
    });

    describe('GET /:id', () => {
      it('should return a customer if valid ID is passed', async () => {
        const customer = new Customer({ name: 'customer', phone: '12345', isGold: true });
        await customer.save();
  
        const response = await request(server).get('/api/customers/' + customer._id);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', customer.name);
        expect(response.body).toHaveProperty('phone', customer.phone);
        expect(response.body).toHaveProperty('genre', customer.genre);
      });
  
      it('should return 404 if invalid ID is passed', async () => {
        const response = await request(server).get('/api/customers/1');
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no customer with the given ID exists', async () => {
        const response = await request(server).get('/api/customers/' + mongoose.Types.ObjectId());
        expect(response.status).toBe(404);
      });
    });

    describe('POST /', () => {
      let token;
      let name;
      let phone;
      let isGold;
  
      const execute = () => {
        return request(server)
          .post('/api/customers')
          .set('x-auth-token', token)
          .send({ name, phone, isGold });
      };
  
      beforeEach(() => {
        token = new User().generateAuthToken();
        name = 'customer';
        phone = '12345';
        isGold = true;
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 400 if customer name is missing', async () => {
        name = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer name is less than 5 characters', async () => {
        name = 'abc';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer name is more than 50 characters', async () => {
        name = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if customer phone is missing', async () => {
        phone = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer phone is less than 5 characters', async () => {
        phone = '123';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer phone is more than 50 characters', async () => {
        phone = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should save the customer if it is valid', async () => {
        const response = await execute();
  
        const customer = await Customer.find({ name, phone, isGold });
        expect(response.status).toBe(200);
        expect(customer).not.toBe(null);
      });
  
      it('should return the customer if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', name);
        expect(response.body).toHaveProperty('phone', phone);
        expect(response.body).toHaveProperty('isGold', isGold);
      });
    });

    describe('PUT /:id', () => {
      let customer;
      let token;
      let name;
      let phone;
      let isGold;
      let id;
  
      const execute = () => {
        return request(server)
          .put('/api/customers/' + id)
          .set('x-auth-token', token)
          .send({ name, phone, isGold });
      };
  
      beforeEach(async () => {
        customer = new Customer({ name: 'customer1', phone: '12345', isGold: false });
        token = new User().generateAuthToken();
        name = 'customer2';
        phone = '67890';
        isGold = true;
        id = customer._id;
        await customer.save();
      });
  
      it('should return 401 if client is not authenticated', async () => {
        token = '';
        const response = await execute();
  
        expect(response.status).toBe(401);
      });
  
      it('should return 400 if customer name is missing', async () => {
        name = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer name is less than 5 characters', async () => {
        name = 'abc';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer name is more than 50 characters', async () => {
        name = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });

      it('should return 400 if customer phone is missing', async () => {
        phone = null;
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer phone is less than 5 characters', async () => {
        phone = '123';
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 400 if customer phone is more than 50 characters', async () => {
        phone = new Array(52).join('a');
        const response = await execute();
  
        expect(response.status).toBe(400);
      });
  
      it('should return 404 if ID is invalid', async () => {
        id = 1;
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should return 404 if no customer with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should save the customer if it is valid', async () => {
        const response = await execute();
  
        const received = await Customer.findById(customer._id);
        expect(response.status).toBe(200);
        expect(received).not.toBe(null);
      });
  
      it('should return the customer if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', name);
        expect(response.body).toHaveProperty('phone', phone);
        expect(response.body).toHaveProperty('isGold', isGold);
      });
    });

    describe('DELETE /:id', () => {
      let customer;
      let token;
      let id;
  
      const execute = () => {
        return request(server)
          .delete('/api/customers/' + id)
          .set('x-auth-token', token)
          .send();
      };
  
      beforeEach(async () => {
        customer = new Customer({ name: 'customer', phone: '12345', isGold: true });
        token = new User({ isAdmin: true }).generateAuthToken();
        id = customer._id;
        await customer.save();
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
  
      it('should return 404 if no customer with the given ID was found', async () => {
        id = mongoose.Types.ObjectId();
        const response = await execute();
  
        expect(response.status).toBe(404);
      });
  
      it('should delete the customer if it is valid', async () => {
        const response = await execute();
  
        const received = await Customer.findById(customer._id);
        expect(response.status).toBe(200);
        expect(received).toBe(null);
      });
  
      it('should return the customer if it is valid', async () => {
        const response = await execute();      
  
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body).toHaveProperty('name', customer.name);
        expect(response.body).toHaveProperty('phone', customer.phone);
        expect(response.body).toHaveProperty('isGold', customer.isGold);
      });
    });
  });
};
