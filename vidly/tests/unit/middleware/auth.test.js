const auth = require('../../../middleware/auth');
const mongoose = require('mongoose');

const { User } = require('../../../models/user');

describe('auth middleware', () => {
  it('should populate request.user with the payload of a valid JWT', () => {
    const user = { _id: mongoose.Types.ObjectId().toHexString(), isAdmin: true };
    const token = new User(user).generateAuthToken();

    const request = { header: jest.fn().mockReturnValue(token) };
    const response = {};
    const next = jest.fn();

    auth(request, response, next);

    expect(request.user).toMatchObject(user);
  });
});
