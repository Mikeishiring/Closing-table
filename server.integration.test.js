const request = require('supertest');
const { app } = require('./server');

describe('API Integration Tests', () => {
  let offerId;
  let createdOfferId;

  // Test: Single-Use Constraint (offer is deleted after first use)
  test('Single-Use Constraint - Second submission should return invalid (offer deleted)', async () => {
    // Create an offer
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 200000 })
      .expect(200);

    createdOfferId = createResponse.body.offerId;
    expect(createdOfferId).toBeDefined();

    // First submission should succeed
    const firstSubmit = await request(app)
      .post(`/api/offers/${createdOfferId}/submit`)
      .send({ min: 150000 })
      .expect(200);

    expect(firstSubmit.body.status).toBe('success');

    // Second submission should return 'invalid' (offer deleted after first use)
    const secondSubmit = await request(app)
      .post(`/api/offers/${createdOfferId}/submit`)
      .send({ min: 160000 })
      .expect(200);

    // Offer is immediately deleted after mechanism runs, so second attempt is invalid
    expect(secondSubmit.body.status).toBe('invalid');
  });

  // Test: Offer Expiry Simulation
  test('Offer Expiry - Non-existent offer should return invalid status', async () => {
    // Create an offer
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 200000 })
      .expect(200);

    const testOfferId = createResponse.body.offerId;
    expect(testOfferId).toBeDefined();

    // A non-existent offer returns 'invalid'
    const invalidResponse = await request(app)
      .get(`/api/offers/invalid-offer-id-12345`)
      .expect(200);

    expect(invalidResponse.body.status).toBe('invalid');
  });

  // Test: Create offer with valid data
  test('Create offer with valid data', async () => {
    const response = await request(app)
      .post('/api/offers')
      .send({ max: 150000 })
      .expect(200);

    expect(response.body.offerId).toBeDefined();
    expect(typeof response.body.offerId).toBe('string');
  });

  // Test: Create offer with invalid data should fail
  test('Create offer with invalid data should fail', async () => {
    await request(app)
      .post('/api/offers')
      .send({ max: -100 })
      .expect(400);

    // Missing max should fail
    await request(app)
      .post('/api/offers')
      .send({})
      .expect(400);
  });

  // Test: Submit with valid overlap should return success
  test('Submit with valid overlap should return success', async () => {
    // Create offer
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 200000 })
      .expect(200);

    const testOfferId = createResponse.body.offerId;

    // Submit with overlap
    const submitResponse = await request(app)
      .post(`/api/offers/${testOfferId}/submit`)
      .send({ min: 150000 })
      .expect(200);

    expect(submitResponse.body.status).toBe('success');
    expect(submitResponse.body.final).toBe(175000);
    expect(submitResponse.body.resultId).toBeDefined();
    // Note: We no longer return surplus in the response (outcome-only)
  });

  // Test: Submit with gap in bridge zone should return close with suggested
  test('Submit with gap in bridge zone should return close with suggested', async () => {
    // Create offer
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 100000 })
      .expect(200);

    const testOfferId = createResponse.body.offerId;

    // Submit with 10% gap (exactly at boundary)
    const submitResponse = await request(app)
      .post(`/api/offers/${testOfferId}/submit`)
      .send({ min: 110000 })
      .expect(200);

    expect(submitResponse.body.status).toBe('close');
    expect(submitResponse.body.final).toBeNull();
    // Should have a suggested starting point (midpoint: 105000)
    expect(submitResponse.body.suggested).toBe(105000);
    expect(submitResponse.body.resultId).toBeDefined();
    // Note: We no longer return gap in the response (outcome-only)
  });

  // Test: Submit with gap over 10% should return fail
  test('Submit with gap over 10% should return fail', async () => {
    // Create offer
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 100000 })
      .expect(200);

    const testOfferId = createResponse.body.offerId;

    // Submit with gap > 10%
    const submitResponse = await request(app)
      .post(`/api/offers/${testOfferId}/submit`)
      .send({ min: 111000 })
      .expect(200);

    expect(submitResponse.body.status).toBe('fail');
    expect(submitResponse.body.final).toBeNull();
    expect(submitResponse.body.suggested).toBeNull();
    expect(submitResponse.body.resultId).toBeDefined();
    // Note: We no longer return gap in the response (outcome-only)
  });

  // Test: Result endpoint returns outcome-only data
  test('Result endpoint returns outcome-only data', async () => {
    // Create offer and submit
    const createResponse = await request(app)
      .post('/api/offers')
      .send({ max: 200000 })
      .expect(200);

    const testOfferId = createResponse.body.offerId;

    const submitResponse = await request(app)
      .post(`/api/offers/${testOfferId}/submit`)
      .send({ min: 150000 })
      .expect(200);

    const resultId = submitResponse.body.resultId;

    // Fetch result
    const resultResponse = await request(app)
      .get(`/api/results/${resultId}`)
      .expect(200);

    // Result should contain only outcome data
    expect(resultResponse.body.status).toBe('success');
    expect(resultResponse.body.final).toBe(175000);
    expect(resultResponse.body.createdAt).toBeDefined();
    // Should NOT contain original inputs
    expect(resultResponse.body.max).toBeUndefined();
    expect(resultResponse.body.min).toBeUndefined();
    expect(resultResponse.body.email).toBeUndefined();
    expect(resultResponse.body.surplus).toBeUndefined();
  });
});
