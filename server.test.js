const { calculateDeal, roundToGranularity, BRIDGE_ZONE_PCT, ROUNDING_GRANULARITY } = require('./server');
const request = require('supertest');

// Note: We need to import the app, but server.js exports the calculateDeal function
// For integration tests, we'll need to start the server or mock it
// For now, let's focus on unit tests for calculateDeal

describe('calculateDeal Function - Unit Tests', () => {
  
  // Test 1: Fair Split - Standard Case
  test('Test 1: Fair Split - CMax=200000, CMin=150000 → FinalOffer=175000', () => {
    const result = calculateDeal(200000, 150000);
    expect(result.status).toBe('success');
    expect(result.final).toBe(175000);
    expect(result.surplus).toBe(50000);
    expect(result.gap).toBeNull();
  });

  // Test 2: Fair Split - Edge Case (Exact Match)
  test('Test 2: Fair Split - Edge Case - CMax=150000, CMin=150000 → FinalOffer=150000', () => {
    const result = calculateDeal(150000, 150000);
    expect(result.status).toBe('success');
    expect(result.final).toBe(150000);
    expect(result.surplus).toBe(0);
    expect(result.gap).toBeNull();
  });

  // Test 3: Bridge Zone - Max Gap (Exactly 10%)
  test('Test 3: Bridge Zone - Max Gap - CMax=100000, CMin=110000 → status=close, Gap=10000', () => {
    const result = calculateDeal(100000, 110000);
    expect(result.status).toBe('close');
    expect(result.gap).toBe(10000);
    expect(result.final).toBeNull();
    expect(result.surplus).toBeNull();
    
    // Verify it's exactly 10%: gap / cMax = 10000 / 100000 = 0.10 = 10%
    const gapPercent = (result.gap / 100000) * 100;
    expect(gapPercent).toBe(10);
  });

  // Test 4: No Deal - Just Over Limit
  test('Test 4: No Deal - Just Over Limit - CMax=100000, CMin=110001 → status=fail', () => {
    const result = calculateDeal(100000, 110001);
    expect(result.status).toBe('fail');
    expect(result.gap).toBe(10001);
    expect(result.final).toBeNull();
    expect(result.surplus).toBeNull();
    
    // Verify it's over 10%: gap / cMax = 10001 / 100000 = 0.10001 = 10.001%
    const gapPercent = (result.gap / 100000) * 100;
    expect(gapPercent).toBeGreaterThan(10);
  });

  // Test 5: Rounding - Requires rounding to nearest $1,000
  test('Test 5: Rounding - CMax=101000, CMin=90000 → FinalOffer should round to nearest 1000', () => {
    const result = calculateDeal(101000, 90000);
    expect(result.status).toBe('success');
    
    // Raw calculation: 90000 + (11000 / 2) = 90000 + 5500 = 95500
    // Should round to nearest 1000: 96000 (rounds up) or 95000 (rounds down)
    // Let's check what the actual implementation does
    const rawFinal = 90000 + (11000 / 2); // 95500
    const expectedRounded = roundToGranularity(rawFinal);
    
    expect(result.final).toBe(expectedRounded);
    expect(result.final % 1000).toBe(0); // Must be divisible by 1000
    expect(result.final).toBeGreaterThanOrEqual(95000);
    expect(result.final).toBeLessThanOrEqual(96000);
  });

  // Additional edge cases
  test('Bridge Zone - Small gap (1%)', () => {
    const result = calculateDeal(100000, 101000);
    expect(result.status).toBe('close');
    expect(result.gap).toBe(1000);
  });

  test('No Deal - Large gap (50%)', () => {
    const result = calculateDeal(100000, 150000);
    expect(result.status).toBe('fail');
    expect(result.gap).toBe(50000);
  });

  test('Invalid inputs throw errors', () => {
    expect(() => calculateDeal(-100, 50000)).toThrow();
    expect(() => calculateDeal(100000, -50)).toThrow();
    expect(() => calculateDeal(0, 50000)).toThrow();
    expect(() => calculateDeal(100000, 0)).toThrow();
    expect(() => calculateDeal(NaN, 50000)).toThrow();
    expect(() => calculateDeal(100000, Infinity)).toThrow();
  });
});

// Integration tests require the server to be running
// We'll create a separate test file for integration tests
// For now, these are the core unit tests

