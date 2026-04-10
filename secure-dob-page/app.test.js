// Tests for backend DOB submission validation (/check-dob)
const request = require('supertest');
let app;

describe('/check-dob API validation', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    app = require('./app');
  });

  test('Valid happy path: correct DOBs', async () => {
    // Backend expects yourDate == BRAM_DOB, herDate == CHANU_DOB (not swapped!)
    const resp = await request(app)
      .post('/check-dob')
      .send({
        herDate: '1999-08-03', // Chanu (should match value of CHANU_DOB)
        yourDate: '1999-04-28', // Bram (should match value of BRAM_DOB)
      })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(200);
    expect(resp.body.success).toBe(true);
  });

  test('Rejects non-YYYY-MM-DD', async () => {
    const resp = await request(app)
      .post('/check-dob')
      .send({ herDate: '08/03/1999', yourDate: '1999-04-28' })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toMatch(/format/i);
  });

  test('Rejects impossible dates (2023-02-30)', async () => {
    const resp = await request(app)
      .post('/check-dob')
      .send({ herDate: '1999-08-03', yourDate: '2023-02-30' })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toMatch(/invalid/i);
  });

  test('Rejects out-of-bounds year', async () => {
    const resp = await request(app)
      .post('/check-dob')
      .send({ herDate: '1882-01-01', yourDate: '1999-04-28' })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toMatch(/between 1900/);
  });

  test('Rejects missing fields', async () => {
    const resp = await request(app)
      .post('/check-dob')
      .send({ herDate: '', yourDate: '' })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(400);
    expect(resp.body.message).toMatch(/missing/i);
  });

  test('Friendly error on wrong dates', async () => {
    const resp = await request(app)
      .post('/check-dob')
      .send({ herDate: '1999-07-25', yourDate: '1999-04-27' })
      .set('Content-Type', 'application/json');
    expect(resp.statusCode).toBe(401);
    expect(resp.body.success).toBe(false);
    expect(resp.body.message).toMatch(/incorrect/i);
  });
});
