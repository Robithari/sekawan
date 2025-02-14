const request = require('supertest');
const app = require('../server');

test('GET /api/posts', async () => {
    const response = await request(app).get('/api/posts');
    expect(response.status).toBe(200);
});