const tap = require('tap');
const supertest = require('supertest');
const app = require('../app');
const server = supertest(app);

const mockUser = {
    name: 'Clark Kent',
    email: 'clark@superman.com',
    password: 'Krypt()n8',
    preferences:['movies', 'comics']
};

let token = '';

// Auth tests

tap.test('POST /users/signup', async (t) => { 
    const response = await server.post('/users/signup').send(mockUser);
    t.equal(response.status, 200);
    t.end();
});

tap.test('POST /users/signup with missing email', async (t) => {
    const response = await server.post('/users/signup').send({
        name: mockUser.name,
        password: mockUser.password
    });
    t.equal(response.status, 400);
    t.end();
});

tap.test('POST /users/login', async (t) => { 
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: mockUser.password
    });
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'token');
    token = response.body.token;
    t.end();
});

tap.test('POST /users/login with wrong password', async (t) => {
    const response = await server.post('/users/login').send({
        email: mockUser.email,
        password: 'wrongpassword'
    });
    t.equal(response.status, 401);
    t.end();
});

// Preferences tests

tap.test('GET /users/preferences', async (t) => {
    const response = await server.get('/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'preferences');
    t.same(response.body.preferences, mockUser.preferences);
    t.end();
});

tap.test('GET /users/preferences without token', async (t) => {
    const response = await server.get('/users/preferences');
    t.equal(response.status, 401);
    t.end();
});

tap.test('PUT /users/preferences', async (t) => {
    const response = await server.put('/users/preferences').set('Authorization', `Bearer ${token}`).send({
        preferences: ['movies', 'comics', 'games']
    });
    t.equal(response.status, 200);
});


// Stub newsService to avoid external API calls during tests
const newsService = require('../src/services/newsService');
const _origSubmit = newsService.submitSearchJob;
const _origFetch = newsService.fetchJobIfReady;

newsService.submitSearchJob = async () => 'test-job-123';
newsService.fetchJobIfReady = async (jobId) => ({ ready: true, status: 'completed', articles: [{ title: 'Stubbed article', link: 'https://example.com' }] });

tap.test('Check PUT /users/preferences', async (t) => {
    const response = await server.get('/users/preferences').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.same(response.body.preferences, ['movies', 'comics', 'games']);
    t.end();
});

// News tests


tap.test('GET /news', async (t) => {
    const response = await server.get('/news').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.end();
});

tap.test('GET /news without token', async (t) => {
    const response = await server.get('/news');
    t.equal(response.status, 401);
    t.end();
});

// Search query validation tests

tap.test('GET /news/search with query < 3 words (validation error)', async (t) => {
    const response = await server.get('/news/search').query({ query: 'one two' }).set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 400);
    t.hasOwnProp(response.body, 'error');
    t.match(response.body.error, /Invalid search query/);
    t.end();
});

tap.test('GET /news/search with query < 10 characters (validation error)', async (t) => {
    const response = await server.get('/news/search').query({ query: 'short' }).set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 400);
    t.hasOwnProp(response.body, 'error');
    t.match(response.body.error, /Invalid search query/);
    t.end();
});

// Pagination metadata tests

tap.test('GET /news returns pagination metadata', async (t) => {
    const response = await server.get('/news').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'total');
    t.hasOwnProp(response.body, 'page');
    t.hasOwnProp(response.body, 'limit');
    t.equal(response.body.page, 1);
    t.ok(response.body.limit > 0);
    t.end();
});

tap.test('GET /news/search returns 202 with job_id', async (t) => {
    const response = await server.get('/news/search').query({ query: 'AI company acquisitions technology' }).set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 202);
    t.hasOwnProp(response.body, 'job_id');
    t.hasOwnProp(response.body, 'status_url');
    t.equal(response.body.job_id, 'test-job-123');
    t.end();
});

tap.test('GET /news/job/:jobId returns pagination metadata when ready', async (t) => {
    const response = await server.get('/news/job/test-job-123').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.hasOwnProp(response.body, 'total');
    t.hasOwnProp(response.body, 'page');
    t.hasOwnProp(response.body, 'limit');
    t.hasOwnProp(response.body, 'count');
    t.equal(response.body.page, 1);
    t.equal(response.body.count, response.body.news.length);
    t.end();
});

tap.test('GET /news/job/:jobId without token', async (t) => {
    const response = await server.get('/news/job/some-job-id');
    t.equal(response.status, 401);
    t.end();
});

// Job not ready scenario
tap.test('GET /news/job/:jobId returns 202 when job not ready', async (t) => {
    newsService.fetchJobIfReady = async (jobId) => ({ ready: false, status: 'processing', articles: [] });
    const response = await server.get('/news/job/processing-job-id').set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 202);
    t.hasOwnProp(response.body, 'status');
    t.hasOwnProp(response.body, 'message');
    newsService.fetchJobIfReady = async (jobId) => ({ ready: true, status: 'completed', articles: [{ title: 'Stubbed article', link: 'https://example.com' }] });
    t.end();
});

// Edge case: Invalid token format
tap.test('GET /news with malformed token', async (t) => {
    const response = await server.get('/news').set('Authorization', 'InvalidToken');
    t.equal(response.status, 401);
    t.hasOwnProp(response.body, 'error');
    t.end();
});

tap.teardown(() => {
    // restore originals
    newsService.submitSearchJob = _origSubmit;
    newsService.fetchJobIfReady = _origFetch;
    process.exit(0);
});