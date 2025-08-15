// Mock cache file for login tests
// This file is auto-generated during test setup
module.exports = {
  login: {
    '/api/login/account': {
      status: 'ok',
      type: 'account',
      currentAuthority: 'admin',
      data: {
        token: 'mock-token',
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    }
  }
};