import { expect, test } from '@playwright/test';

test.describe('API Integration', () => {
  const API_BASE = 'http://localhost:8081/api/v1';

  test('should check API health endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:8081/health');
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should register a new user', async ({ request }) => {
    const userData = {
      username: `testuser${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      nickname: 'Test User',
    };

    const response = await request.post(`${API_BASE}/users/register`, {
      data: userData,
    });

    expect(response.status()).toBe(201);

    const user = await response.json();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.nickname).toBe(userData.nickname);
    expect(user.role).toBe('user');
    expect(user.status).toBe('active');
  });

  test('should login with valid credentials', async ({ request }) => {
    // First register a user
    const userData = {
      username: `logintest${Date.now()}`,
      email: `logintest${Date.now()}@example.com`,
      password: 'password123',
      nickname: 'Login Test',
    };

    await request.post(`${API_BASE}/users/register`, {
      data: userData,
    });

    // Then try to login
    const loginResponse = await request.post(`${API_BASE}/users/login`, {
      data: {
        email: userData.email,
        password: userData.password,
      },
    });

    expect(loginResponse.status()).toBe(200);

    const loginData = await loginResponse.json();
    expect(loginData.token).toBeDefined();
    expect(loginData.user.email).toBe(userData.email);
    expect(loginData.user.username).toBe(userData.username);
  });

  test('should fail login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/users/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('should get user profile with valid token', async ({ request }) => {
    // First register and login a user
    const userData = {
      username: `profiletest${Date.now()}`,
      email: `profiletest${Date.now()}@example.com`,
      password: 'password123',
      nickname: 'Profile Test',
    };

    await request.post(`${API_BASE}/users/register`, {
      data: userData,
    });

    const loginResponse = await request.post(`${API_BASE}/users/login`, {
      data: {
        email: userData.email,
        password: userData.password,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Get profile with token
    const profileResponse = await request.get(`${API_BASE}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(profileResponse.status()).toBe(200);

    const profile = await profileResponse.json();
    expect(profile.email).toBe(userData.email);
    expect(profile.username).toBe(userData.username);
  });

  test('should fail to get user profile without token', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/profile`);
    expect(response.status()).toBe(401);
  });

  test('should fail to access admin endpoints without admin role', async ({
    request,
  }) => {
    // Register a regular user
    const userData = {
      username: `regularuser${Date.now()}`,
      email: `regular${Date.now()}@example.com`,
      password: 'password123',
    };

    await request.post(`${API_BASE}/users/register`, {
      data: userData,
    });

    const loginResponse = await request.post(`${API_BASE}/users/login`, {
      data: {
        email: userData.email,
        password: userData.password,
      },
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Try to access admin endpoint
    const response = await request.get(`${API_BASE}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(response.status()).toBe(403);
  });
});
