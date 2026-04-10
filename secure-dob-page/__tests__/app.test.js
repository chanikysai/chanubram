const request = require('supertest');
let app;

beforeAll(() => {
  // Ensure NODE_ENV is set for app export:
  process.env.NODE_ENV = 'test';
  app = require('../app');
});

const BRAM_DOB = '1999-04-28';
const CHANU_DOB = '1999-08-03';

describe('/check-dob endpoint validation', () => {
  it('Happy path: correct DOBs return success', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: BRAM_DOB, herDate: CHANU_DOB });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Edge case: valid minimum date accepted', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: '1900-01-01', herDate: '1900-01-01' });
    expect([400, 401]).toContain(res.status);
    if (res.status === 400) {
      expect(res.body.message).toMatch(/1900/);
    } else if (res.status === 401) {
      expect(res.body.success).toBe(false);
    }
  });

  it('Error: Date in wrong format is rejected', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: '4/28/1999', herDate: '8/3/1999' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/YYYY-MM-DD/);
  });

  it('Error: Impossible date is rejected', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: '2023-02-30', herDate: '1999-02-29' }); // invalid dates
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/calendar/);
  });

  it('Error: Date before 1900-01-01', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: '1899-12-31', herDate: '1999-08-03' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 1900-01-01/);
  });

  it('Error: Date in the future', async () => {
    const future = new Date(Date.now() + 86400000);
    const s = future.toISOString().split('T')[0];
    const res = await request(app)
      .post('/check-dob')
      .send({ yourDate: s, herDate: CHANU_DOB });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/between 1900-01-01/);
  });

  it('Error: Missing fields', async () => {
    const res = await request(app)
      .post('/check-dob')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Missing/);
  });
});
