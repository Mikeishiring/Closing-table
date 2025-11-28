/**
 * Stability Tests for The Closing Table Refactoring
 * These tests verify zero regression of the core mechanism and API constraints
 */

const { calculateDeal } = require('./server');
const request = require('supertest');
const { app } = require('./server');

console.log('🧪 Running Stability Tests for The Closing Table...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// ============================================
// PHASE 2: STABILITY AND VERIFICATION TESTS
// ============================================

// Test 1: Fair Split & Rounding Down
// CMax = 101,000, CMin = 90,000. Expected FinalOffer ≈ 95,000
test('Test 1: Fair Split & Rounding Down - CMax=101000, CMin=90000 → FinalOffer≈95000', () => {
    const result = calculateDeal(101000, 90000);
    
    // Verify success status
    if (result.status !== 'success') {
        throw new Error(`Expected status 'success', got '${result.status}'`);
    }
    
    // Verify final is approximately 95,000 (within rounding tolerance)
    if (result.final < 94000 || result.final > 96000) {
        throw new Error(`Expected final ≈ 95000, got ${result.final}`);
    }
    
    // Verify final is rounded to nearest 1000
    if (result.final % 1000 !== 0) {
        throw new Error(`Expected final to be multiple of 1000, got ${result.final}`);
    }
    
    // Verify surplus calculation
    const expectedSurplus = 101000 - 90000; // 11000
    if (result.surplus !== expectedSurplus) {
        throw new Error(`Expected surplus ${expectedSurplus}, got ${result.surplus}`);
    }
    
    console.log(`   Final: $${result.final.toLocaleString()}, Surplus: $${result.surplus.toLocaleString()}`);
});

// Test 2: Bridge Zone Boundary
// CMax = 200,000, CMin = 220,000 (exactly 10% gap). Expected status: BRIDGE_ZONE (close)
test('Test 2: Bridge Zone Boundary - CMax=200000, CMin=220000 (exactly 10%) → status=close', () => {
    const result = calculateDeal(200000, 220000);
    
    // Verify status is 'close' (BRIDGE_ZONE)
    if (result.status !== 'close') {
        throw new Error(`Expected status 'close', got '${result.status}'`);
    }
    
    // Verify gap is exactly 20,000
    if (result.gap !== 20000) {
        throw new Error(`Expected gap 20000, got ${result.gap}`);
    }
    
    // Verify gap percentage is exactly 10%
    const gapPercent = (result.gap / 200000) * 100;
    if (Math.abs(gapPercent - 10) > 0.001) {
        throw new Error(`Expected gap percentage 10%, got ${gapPercent}%`);
    }
    
    // Verify final and surplus are null
    if (result.final !== null) {
        throw new Error(`Expected final to be null, got ${result.final}`);
    }
    if (result.surplus !== null) {
        throw new Error(`Expected surplus to be null, got ${result.surplus}`);
    }
    
    console.log(`   Gap: $${result.gap.toLocaleString()}, Gap %: ${gapPercent.toFixed(2)}%`);
});

// Test 3: No Deal Boundary
// CMax = 200,000, CMin = 220,001 (>10% gap). Expected status: NO_DEAL (fail)
test('Test 3: No Deal Boundary - CMax=200000, CMin=220001 (>10%) → status=fail', () => {
    const result = calculateDeal(200000, 220001);
    
    // Verify status is 'fail' (NO_DEAL)
    if (result.status !== 'fail') {
        throw new Error(`Expected status 'fail', got '${result.status}'`);
    }
    
    // Verify gap is 20,001
    if (result.gap !== 20001) {
        throw new Error(`Expected gap 20001, got ${result.gap}`);
    }
    
    // Verify gap percentage is > 10%
    const gapPercent = (result.gap / 200000) * 100;
    if (gapPercent <= 10) {
        throw new Error(`Expected gap percentage > 10%, got ${gapPercent}%`);
    }
    
    // Verify final and surplus are null
    if (result.final !== null) {
        throw new Error(`Expected final to be null, got ${result.final}`);
    }
    if (result.surplus !== null) {
        throw new Error(`Expected surplus to be null, got ${result.surplus}`);
    }
    
    console.log(`   Gap: $${result.gap.toLocaleString()}, Gap %: ${gapPercent.toFixed(2)}%`);
});

// Run async tests
(async () => {
    // Test 4: Single-Use Constraint (API Test)
    await testAsync('Test 4: Single-Use Constraint - Second submission should fail with 403', async () => {
        // Create an offer
        const createResponse = await request(app)
            .post('/api/offers')
            .send({ max: 200000, email: 'test@example.com' });
        
        if (createResponse.status !== 200) {
            throw new Error(`Failed to create offer: ${createResponse.status}`);
        }
        
        const offerId = createResponse.body.offerId;
        if (!offerId) {
            throw new Error('No offerId returned from create');
        }
        
        // First submission should succeed
        const firstSubmit = await request(app)
            .post(`/api/offers/${offerId}/submit`)
            .send({ min: 150000, email: 'candidate@example.com' });
        
        if (firstSubmit.status !== 200) {
            throw new Error(`First submission failed: ${firstSubmit.status}`);
        }
        
        if (firstSubmit.body.status !== 'success') {
            throw new Error(`First submission should succeed, got status: ${firstSubmit.body.status}`);
        }
        
        // Second submission should fail with 403
        const secondSubmit = await request(app)
            .post(`/api/offers/${offerId}/submit`)
            .send({ min: 160000, email: 'candidate2@example.com' });
        
        if (secondSubmit.status !== 403) {
            throw new Error(`Expected 403, got ${secondSubmit.status}`);
        }
        
        if (secondSubmit.body.status !== 'used') {
            throw new Error(`Expected status 'used', got '${secondSubmit.body.status}'`);
        }
        
        if (!secondSubmit.body.error || !secondSubmit.body.error.includes('already been used')) {
            throw new Error('Error message should indicate offer has been used');
        }
        
        console.log(`   First submission: ${firstSubmit.body.status}, Second submission: ${secondSubmit.body.status} (403)`);
    });
    
    // Test 5: Offer Data Integrity
    await testAsync('Test 5: Offer Data Integrity - Offer creation and retrieval schema', async () => {
        // Create an offer
        const createResponse = await request(app)
            .post('/api/offers')
            .send({ max: 200000, email: 'company@example.com' });
        
        if (createResponse.status !== 200) {
            throw new Error(`Failed to create offer: ${createResponse.status}`);
        }
        
        const offerId = createResponse.body.offerId;
        if (!offerId || typeof offerId !== 'string') {
            throw new Error(`Invalid offerId: ${offerId}`);
        }
        
        // Check offer status
        const statusResponse = await request(app)
            .get(`/api/offers/${offerId}`);
        
        if (statusResponse.status !== 200) {
            throw new Error(`Failed to get offer status: ${statusResponse.status}`);
        }
        
        // Verify status response schema
        if (!statusResponse.body.hasOwnProperty('status')) {
            throw new Error('Status response missing "status" field');
        }
        
        if (statusResponse.body.status !== 'ok') {
            throw new Error(`Expected status 'ok', got '${statusResponse.body.status}'`);
        }
        
        // Submit and verify response schema
        const submitResponse = await request(app)
            .post(`/api/offers/${offerId}/submit`)
            .send({ min: 150000, email: 'candidate@example.com' });
        
        if (submitResponse.status !== 200) {
            throw new Error(`Submit failed: ${submitResponse.status}`);
        }
        
        // Verify submit response schema matches expected format
        const requiredFields = ['status', 'final', 'surplus', 'gap', 'resultId'];
        for (const field of requiredFields) {
            if (!submitResponse.body.hasOwnProperty(field)) {
                throw new Error(`Submit response missing required field: ${field}`);
            }
        }
        
        // Verify status is valid
        const validStatuses = ['success', 'close', 'fail'];
        if (!validStatuses.includes(submitResponse.body.status)) {
            throw new Error(`Invalid status: ${submitResponse.body.status}`);
        }
        
        // If success, verify final and surplus are numbers
        if (submitResponse.body.status === 'success') {
            if (typeof submitResponse.body.final !== 'number') {
                throw new Error(`Expected final to be number, got ${typeof submitResponse.body.final}`);
            }
            if (typeof submitResponse.body.surplus !== 'number') {
                throw new Error(`Expected surplus to be number, got ${typeof submitResponse.body.surplus}`);
            }
            if (submitResponse.body.resultId === null) {
                throw new Error('Expected resultId for successful deal');
            }
        }
        
        console.log(`   Offer ID: ${offerId}, Submit status: ${submitResponse.body.status}`);
    });
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('='.repeat(60));
    
    if (testsFailed === 0) {
        console.log('✅ All stability tests passed! Zero regression confirmed.');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed. Please review the errors above.');
        process.exit(1);
    }
})();
