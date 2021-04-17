const supertest = require('supertest');
const serverApp = require('../api');
const simpleResponse = require('./fixtures/simpleResponse.json');
const multipleComments = require('./fixtures/multipleComments.json');

describe('Process openapi', () => {
  let request;
  beforeAll(async () => {
    const app = await serverApp();
    request = supertest(app);
  });
  it('Should return swaggerObject correctly', () => {
    const payload = `
    /**
     * POST /api/v1/albums
     * @param {array<object>} request.body.required
     */
    `;
    const body = { payload };
    return request
      .post('/api/v1/process-openapi')
      .send(body)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        expect(res.body).toEqual(simpleResponse);
      });
  });
  it('Should return swaggerObject correctly', () => {
    const payload = `
    /**
     * POST /api/v1/albums
     * @param {array<object>} request.body.required
     */

    /**
     * GET /api/v1/albums
     */
    `;
    const body = { payload };
    return request
      .post('/api/v1/process-openapi')
      .send(body)
      .expect(200)
      .expect('Content-Type', /json/)
      .then(res => {
        expect(res.body).toEqual(multipleComments);
      });
  });
});
