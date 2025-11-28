const assert = require('assert');
const { computeOutcome } = require('./mechanism');

// Test 1: Success case - overlap
let out = computeOutcome(160000, 140000);
assert.strictEqual(out.status, 'success', 'Should be success when min <= max');
assert.strictEqual(out.surplus, 20000, 'Surplus should be 20000');
assert.strictEqual(out.final, 150000, 'Final should be midpoint 150k (already multiple of 1k)');
assert.strictEqual(out.gap, null, 'Gap should be null for success');

// Test 2: Success with rounding
out = computeOutcome(145000, 135000);
assert.strictEqual(out.status, 'success');
assert.strictEqual(out.surplus, 10000);
assert.strictEqual(out.final, 140000, 'Should round to nearest 1k');

// Test 3: Success with rounding up
out = computeOutcome(150000, 140000);
assert.strictEqual(out.status, 'success');
assert.strictEqual(out.surplus, 10000);
assert.strictEqual(out.final, 145000, 'Midpoint 145k should round to 145k');

// Test 4: Close (10% zone) - exactly at 10%
out = computeOutcome(140000, 154000); // 154k is exactly 10% above 140k
assert.strictEqual(out.status, 'close', 'Should be close at exactly 10%');
assert.strictEqual(out.gap, 14000, 'Gap should be 14000');
assert.strictEqual(out.final, null, 'Final should be null for close');
assert.strictEqual(out.surplus, null, 'Surplus should be null for close');

// Test 5: Close (within 10% zone)
out = computeOutcome(140000, 150000); // 150k is 7.14% above 140k
assert.strictEqual(out.status, 'close', 'Should be close when within 10%');
assert.strictEqual(out.gap, 10000, 'Gap should be 10000');

// Test 6: Fail (>10%)
out = computeOutcome(140000, 160000); // 160k is 14.3% above 140k
assert.strictEqual(out.status, 'fail', 'Should be fail when >10%');
assert.strictEqual(out.gap, 20000, 'Gap should be 20000');
assert.strictEqual(out.final, null, 'Final should be null for fail');
assert.strictEqual(out.surplus, null, 'Surplus should be null for fail');

// Test 7: Edge case - exact match
out = computeOutcome(150000, 150000);
assert.strictEqual(out.status, 'success', 'Exact match should be success');
assert.strictEqual(out.surplus, 0, 'Surplus should be 0');
assert.strictEqual(out.final, 150000, 'Final should be 150k');

// Test 8: Edge case - just above 10%
out = computeOutcome(140000, 154001); // 154001 is just above 10% (154000)
assert.strictEqual(out.status, 'fail', 'Just above 10% should be fail');

console.log('✅ All mechanism tests passed');

