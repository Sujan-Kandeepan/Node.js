const lib = require('../lib');
const db = require('../db');
const mail = require('../mail');

describe('absolute', () => {
  it('should return a positive number if input is positive', () => {
    const result = lib.absolute(1);
    expect(result).toBe(1);
  });
  
  it('should return a positive number if input is negative', () => {
    const result = lib.absolute(-1);
    expect(result).toBe(1);
  });
  
  it('should return zero if input is zero', () => {
    const result = lib.absolute(0);
    expect(result).toBe(0);
  });
});

describe('greet', () => {
  it('should return the greeting message', () => {
    const result = lib.greet('Sujan');
    expect(result).toMatch(/Sujan/); // toContain('Sujan')
  });
});

describe('getCurrencies', () => {
  it('should return supported currencies', () => {
    const result = lib.getCurrencies();

    // Too general
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // Too specific
    expect(result[0]).toBe('USD');
    expect(result[1]).toBe('AUD');
    expect(result[2]).toBe('EUR');

    // Proper method
    expect(result).toContain('USD');
    expect(result).toContain('AUD');
    expect(result).toContain('EUR');

    // Ideal method
    expect(result).toEqual(expect.arrayContaining(['AUD', 'EUR', 'USD']));
  });
});

describe('getProduct', () => {
  it('should return the product with the given ID', () => {
    const result = lib.getProduct(1);
    expect(result).toEqual({ id: 1, price: 10, category: 'A' }); // match entire object
    expect(result).toMatchObject({ id: 1, price: 10 }); // match given properties
    expect(result).toHaveProperty('id', 1); // check for specific property
  });
});

describe('registerUser', () => {
  it('should throw exception if username is falsy', () => {
    const args = [null, undefined, NaN, '', 0, false];
    args.forEach(arg => {
      expect(() => { lib.registerUser(arg) }).toThrow();
    });
  });

  it('should return a user object if valid username is passed', () => {
    const result = lib.registerUser('Sujan');
    expect(result).toMatchObject({ username: 'Sujan' });
    expect(result.id).toBeGreaterThan(0);
  });
});

describe('applyDiscount', () => {
  it('should apply 10% discount if customer has more than 10 points', () => {
    db.getCustomerSync = function(customerId) {
      console.log('Fake reading customer...');
      return { id: customerId, points: 20 };
    };

    const order = { customerId: 1, totalPrice: 10 };
    lib.applyDiscount(order);
    expect(order.totalPrice).toBe(9);
  });
});

describe('notifyCustomer', () => {
  it('should send an email to the customer', () => {
    db.getCustomerSync = jest.fn().mockReturnValue({ email: 'a' });
    mail.send = jest.fn();

    lib.notifyCustomer({ customerId: 1 });
    
    expect(mail.send).toHaveBeenCalled();
    expect(mail.send.mock.calls[0][0]).toBe('a');
    expect(mail.send.mock.calls[0][1]).toMatch(/order/); // first function call, second argument
  });
});
