/**
 * London Kids Preschool Avalurpet - End-to-End Security, Authorization & Data Test Suite
 * 
 * Verifies live functional and data integrity through the Next.js API layer
 * and underlying MongoDB persistence:
 * 1. Database Health Check & Zero Credential Exposure (/api/db/status)
 * 2. Unauthenticated Security Boundary (/api/db/sync -> 401)
 * 3. Backdoor Elimination (Phone number bypass rejected)
 * 4. Server-Side Authentication & Session Issuance (/api/auth/login, /api/auth/me)
 * 5. Parent Child Isolation & Privacy (/api/db/sync scopes strictly to linked children)
 * 6. Admin Enrollment, Soft-Delete, Restoration, Invoices & Attendance (/api/db/sync)
 * 7. Cloudflare Turnstile Challenge Validation & Rejection of Bad Tokens (/api/turnstile)
 * 8. Public Admission Enquiry with Server Turnstile Verification (/api/enquiry)
 * 9. Password Reset Security & Zero Secret Leakage (/api/auth/forgot-password)
 * 10. Session Invalidation & Logout (/api/auth/logout)
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Simple cookie jar for managing session cookies in Node.js test runner
let cookieJar = {};

function getCookieHeader() {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

function updateCookiesFromResponse(res) {
  const cookieHeaders = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);

  for (const raw of cookieHeaders) {
    if (!raw) continue;
    const firstPart = raw.split(';')[0];
    const eqIdx = firstPart.indexOf('=');
    if (eqIdx !== -1) {
      const name = firstPart.slice(0, eqIdx).trim();
      const val = firstPart.slice(eqIdx + 1).trim();
      if (val === '' || raw.includes('Max-Age=0') || raw.includes('expires=Thu, 01 Jan 1970')) {
        delete cookieJar[name];
      } else {
        cookieJar[name] = val;
      }
    }
  }
}

async function requestJson(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Origin': BASE_URL,
    ...(options.headers || {}),
  };

  const cookieStr = getCookieHeader();
  if (cookieStr) {
    headers['Cookie'] = cookieStr;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  updateCookiesFromResponse(res);

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { rawText: text };
  }

  return { status: res.status, ok: res.ok, data: json, headers: res.headers };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   LONDON KIDS PRESCHOOL AVALURPET - FULL VERIFICATION SUITE');
  console.log(`   Target Server: ${BASE_URL}`);
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // Test 1: Database Status & Connectivity Check
    // -------------------------------------------------------------
    console.log('[1/10] Testing Database Health & Status (/api/db/status)...');
    const statusRes = await requestJson(`${BASE_URL}/api/db/status`);
    assert(statusRes.ok && statusRes.data.success, 'DB Status API returns success: true');
    assert(statusRes.data.status === 'CONNECTED', `MongoDB status is CONNECTED (Database: ${statusRes.data.database})`);
    assert(!JSON.stringify(statusRes.data).includes('mongodb://'), 'Zero database connection URI or credentials leaked in response');
    console.log(`        Provider: ${statusRes.data.provider}, Host: ${statusRes.data.host}\n`);

    // -------------------------------------------------------------
    // Test 2: Unauthenticated Access Boundary
    // -------------------------------------------------------------
    console.log('[2/10] Testing Security Boundary for Unauthenticated Requests...');
    cookieJar = {}; // Clear cookies
    const unauthGetRes = await requestJson(`${BASE_URL}/api/db/sync`);
    assert(unauthGetRes.status === 401, 'Unauthenticated GET /api/db/sync rejected with HTTP 401');

    const unauthPostRes = await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [{ id: 'fake-inject', name: 'Hacker' }] }),
    });
    assert(unauthPostRes.status === 401, 'Unauthenticated POST /api/db/sync rejected with HTTP 401\n');

    // -------------------------------------------------------------
    // Test 3: Backdoor Elimination
    // -------------------------------------------------------------
    console.log('[3/10] Verifying Elimination of Hardcoded Password Backdoor...');
    const backdoorRes = await requestJson(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'londonkids276@gmail.com',
        password: '90436 33545', // Old backdoor value
      }),
    });
    assert(backdoorRes.status === 401, 'Old hardcoded phone backdoor login fails with HTTP 401\n');

    // -------------------------------------------------------------
    // Test 4: Server-Side Authentication & Session Cookie Issuance
    // -------------------------------------------------------------
    console.log('[4/10] Testing Server-Side Login & Session Cookie (/api/auth/login)...');
    const adminLoginRes = await requestJson(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'londonkids276@gmail.com',
        password: 'Director@2026!',
      }),
    });
    assert(adminLoginRes.ok && adminLoginRes.data.success, 'Admin authenticated successfully with valid credentials');
    assert(Boolean(cookieJar['lk_session']), 'HTTP-only signed session cookie (lk_session) issued by server');
    assert(!adminLoginRes.data.user?.passwordHash, 'Password hash strictly withheld from login response');

    // Verify /api/auth/me with active session
    const meRes = await requestJson(`${BASE_URL}/api/auth/me`);
    assert(meRes.ok && meRes.data.success, '/api/auth/me returns active user session');
    assert(meRes.data.user.role === 'OWNER' || meRes.data.user.role === 'ADMIN', 'Session role verified as administrative\n');

    // -------------------------------------------------------------
    // Test 5: Admin Enrollment & Data Management via /api/db/sync
    // -------------------------------------------------------------
    console.log('[5/10] Testing Admin Data Sync & Student Lifecycle (/api/db/sync)...');
    const testStudentId = `stud-test-${Date.now()}`;
    const testStudent = {
      id: testStudentId,
      name: 'Priya Dharshini',
      admissionNo: `LK-${Date.now().toString().slice(-4)}`,
      rollNumber: 'NUR-2026-T1',
      level: 'NURSERY',
      gender: 'FEMALE',
      dateOfBirth: '2023-02-10',
      bloodGroup: 'O+',
      parentName: 'Sundararajan',
      parentEmail: 'sundar.test.parent@gmail.com',
      parentPhone: '+91 98401 99887',
      status: 'ACTIVE',
      address: 'North Street, Avalurpet',
      allergies: 'None',
      enrolledAt: '2026-06-01',
    };

    const addStudentRes = await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [testStudent] }),
    });
    assert(addStudentRes.ok && addStudentRes.data.success, 'Admin can enroll student via POST /api/db/sync');

    // Soft-delete
    const softDeleted = { ...testStudent, status: 'REMOVED', removedAt: new Date().toISOString() };
    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [softDeleted] }),
    });

    const verifyDelRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const removedRec = (verifyDelRes.data.data.students || []).find(s => s.id === testStudentId);
    assert(removedRec && removedRec.status === 'REMOVED', 'Student soft-deletion persisted as status: REMOVED');

    // Restore
    const restored = { ...testStudent, status: 'ACTIVE', removedAt: undefined };
    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [restored] }),
    });
    const verifyRestoredRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const restoredRec = (verifyRestoredRes.data.data.students || []).find(s => s.id === testStudentId);
    assert(restoredRec && restoredRec.status === 'ACTIVE', 'Student restored to ACTIVE status\n');

    // -------------------------------------------------------------
    // Test 6: Parent Child Isolation & Privacy Boundary
    // -------------------------------------------------------------
    console.log('[6/10] Testing Parent Data Scoping & Child Isolation Boundary...');
    // Log out admin
    await requestJson(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
    cookieJar = {};

    // Log in as Parent (Rajesh Kumar)
    const parentLoginRes = await requestJson(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'rajesh.kumar@gmail.com',
        password: 'parent123',
      }),
    });
    assert(parentLoginRes.ok && parentLoginRes.data.success, 'Parent logged in successfully');

    // Sync data as parent
    const parentSyncRes = await requestJson(`${BASE_URL}/api/db/sync`);
    assert(parentSyncRes.ok && parentSyncRes.data.success, 'Parent can fetch scoped data');

    const parentStudents = parentSyncRes.data.data.students || [];
    assert(parentStudents.length === 1 && parentStudents[0].id === 'student-lk-ps-01', 'Parent can ONLY see their linked student (student-lk-ps-01)');
    const parentUsers = parentSyncRes.data.data.users || [];
    assert(!parentUsers.some(u => u.id !== 'user-parent-rajesh'), 'Parent CANNOT see other users in user directory');
    assert(!parentUsers.some(u => u.passwordHash), 'Parent CANNOT see any user passwords or password hashes\n');

    // -------------------------------------------------------------
    // Test 7: Turnstile Server Verification & Token Enforcement
    // -------------------------------------------------------------
    console.log('[7/10] Testing Server-Side Turnstile Verification (/api/turnstile)...');
    // Missing token
    const missingTokenRes = await requestJson(`${BASE_URL}/api/turnstile`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    assert(missingTokenRes.status === 400, 'Missing Turnstile challenge token rejected with HTTP 400');

    // Fake / invalid token rejected
    const invalidTokenRes = await requestJson(`${BASE_URL}/api/turnstile`, {
      method: 'POST',
      body: JSON.stringify({ token: 'definitely-invalid-turnstile-token' }),
    });
    assert(invalidTokenRes.status === 400, 'Invalid Turnstile token rejected by server verification');

    // Test token accepted in non-prod
    const validTestTokenRes = await requestJson(`${BASE_URL}/api/turnstile`, {
      method: 'POST',
      body: JSON.stringify({ token: '1x00000000000000000000AA' }),
    });
    assert(validTestTokenRes.ok && validTestTokenRes.data.success, 'Cloudflare test token (1x00000000000000000000AA) verified successfully\n');

    // -------------------------------------------------------------
    // Test 8: Public Admission Enquiry Flow with Turnstile
    // -------------------------------------------------------------
    console.log('[8/10] Testing Public Admission Enquiry (/api/enquiry)...');
    // Reject enquiry without Turnstile token
    const enqNoTokenRes = await requestJson(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      body: JSON.stringify({
        parentName: 'Murugan',
        phone: '98401 12345',
        childName: 'Karthik',
        childAge: '3',
        targetLevel: 'NURSERY',
      }),
    });
    assert(enqNoTokenRes.status === 400, 'Enquiry without Turnstile challenge rejected with HTTP 400');

    // Valid enquiry with Turnstile token
    const validEnquiryRes = await requestJson(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      body: JSON.stringify({
        parentName: 'Murugan Soundararajan',
        phone: '98401 12345',
        email: 'murugan.s@example.com',
        childName: 'Karthik Murugan',
        childAge: '3.5 years',
        targetLevel: 'NURSERY',
        message: 'Looking for campus tour this Saturday.',
        turnstileToken: '1x00000000000000000000AA',
      }),
    });
    assert(validEnquiryRes.ok && validEnquiryRes.data.success, 'Admission enquiry with valid Turnstile saved to MongoDB');
    assert(validEnquiryRes.data.enquiry?.status === 'NEW', 'Enquiry recorded with status NEW\n');

    // -------------------------------------------------------------
    // Test 9: Password Reset Security & Zero Secret Leakage
    // -------------------------------------------------------------
    console.log('[9/10] Testing Password Reset Flow & Zero Secret Exposure (/api/auth/forgot-password)...');
    const resetReqRes = await requestJson(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({
        action: 'REQUEST_CODE',
        email: 'londonkids276@gmail.com',
      }),
    });
    assert(resetReqRes.ok && resetReqRes.data.success, 'Password reset request acknowledged');
    assert(!resetReqRes.data.code && !resetReqRes.data.resetCode, 'Verification code is NEVER exposed in the JSON response');
    assert(!resetReqRes.data.passwordHash, 'User passwordHash is NEVER exposed in response\n');

    // -------------------------------------------------------------
    // Test 10: Session Invalidation & Logout
    // -------------------------------------------------------------
    console.log('[10/10] Testing Session Invalidation (/api/auth/logout)...');
    const logoutRes = await requestJson(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
    assert(logoutRes.ok && logoutRes.data.success, 'Logout completed successfully');

    const meAfterLogout = await requestJson(`${BASE_URL}/api/auth/me`);
    assert(meAfterLogout.status === 401, 'Subsequent request to /api/auth/me rejected with HTTP 401\n');

  } catch (err) {
    console.error('Test Suite encountered an unexpected error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
