const request = require('supertest');
const app = require('../server');

test('GET /api/users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
});