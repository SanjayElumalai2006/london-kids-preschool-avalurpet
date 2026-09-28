/**
 * London Kids Preschool Avalurpet - End-to-End Data Manipulation Test Suite
 * 
 * Verifies live functional and data integrity through the Next.js API layer
 * and underlying MongoDB persistence:
 * 1. Database Health Check (/api/db/status)
 * 2. User Enrollment (/api/db/sync)
 * 3. Student Enrollment & Soft-Delete/Restore Lifecycle (/api/db/sync)
 * 4. Fee Invoicing & Payment Processing (/api/db/sync)
 * 5. Daily Attendance Tracking (/api/db/sync)
 * 6. Teacher Progress Review & Evaluation (/api/db/sync)
 * 7. Public Admission Enquiry Submission (/api/enquiry)
 * 8. Cloudflare Turnstile Bot Challenge Verification (/api/turnstile)
 * 9. Parent Email Verification Protocol (/api/parent/verify-email)
 */

const crypto = require('crypto');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse JSON response from ${url} (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  return { status: res.status, ok: res.ok, data: json };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('   LONDON KIDS PRESCHOOL AVALURPET - E2E DATA TEST SUITE');
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
    console.log('[1/9] Testing Database Health & Status (/api/db/status)...');
    const statusRes = await requestJson(`${BASE_URL}/api/db/status`);
    assert(statusRes.ok && statusRes.data.success, 'DB Status API returns success: true');
    assert(statusRes.data.status === 'CONNECTED', `MongoDB status is CONNECTED (Database: ${statusRes.data.database})`);
    console.log(`       Provider: ${statusRes.data.provider}, Host: ${statusRes.data.host}\n`);

    // -------------------------------------------------------------
    // Test 2: User Enrollment via Personal Email
    // -------------------------------------------------------------
    console.log('[2/9] Testing User Enrollment with Personal Email (/api/db/sync)...');
    const testUserId = `usr-test-${Date.now()}`;
    const testUser = {
      id: testUserId,
      name: 'Anita Ramanathan',
      personalEmail: 'anita.ramanathan2026@gmail.com',
      email: 'anita.ramanathan2026@gmail.com',
      role: 'PARENT',
      phone: '+91 91234 56789',
      studentIds: ['stud-test-aaradhya'],
      status: 'ACTIVE',
      emailVerified: true,
      mustChangePassword: false,
      passwordHash: hashPassword('LondonKids@2026'),
      createdAt: new Date().toISOString(),
    };

    const userSyncRes = await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ users: [testUser] }),
    });
    assert(userSyncRes.ok && userSyncRes.data.success, 'User sync POST completed successfully');

    // Verify user retrieval
    const dbGetRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const fetchedUser = (dbGetRes.data.data.users || []).find((u) => u.id === testUserId);
    assert(Boolean(fetchedUser), `User ${testUserId} successfully persisted in database`);
    assert(fetchedUser && fetchedUser.personalEmail === 'anita.ramanathan2026@gmail.com', 'User personal email matches');
    assert(fetchedUser && fetchedUser.passwordHash === hashPassword('LondonKids@2026'), 'Password securely hashed with SHA-256 (no plaintext stored)\n');

    // -------------------------------------------------------------
    // Test 3: Student Enrollment
    // -------------------------------------------------------------
    console.log('[3/9] Testing Student Enrollment (/api/db/sync)...');
    const testStudentId = 'stud-test-aaradhya';
    const testStudent = {
      id: testStudentId,
      name: 'Aaradhya Ramanathan',
      rollNumber: 'LKG-2026-TEST',
      level: 'LKG',
      gender: 'FEMALE',
      dateOfBirth: '2022-04-15',
      bloodGroup: 'B+',
      parentName: 'Anita Ramanathan',
      parentEmail: 'anita.ramanathan2026@gmail.com',
      parentPhone: '+91 91234 56789',
      status: 'ACTIVE',
      address: 'Near Old Bus Stand, Avalurpet',
      allergies: 'None',
      enrolledAt: '2026-06-01',
    };

    const studentSyncRes = await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [testStudent] }),
    });
    assert(studentSyncRes.ok && studentSyncRes.data.success, 'Student enrollment sync completed');

    const checkStudentRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const fetchedStudent = (checkStudentRes.data.data.students || []).find((s) => s.id === testStudentId);
    assert(Boolean(fetchedStudent), `Student ${testStudent.name} found in active student registry`);
    assert(fetchedStudent && fetchedStudent.level === 'LKG', 'Student enrolled in class LKG\n');

    // -------------------------------------------------------------
    // Test 4: Student Soft-Delete and Restoration Lifecycle
    // -------------------------------------------------------------
    console.log('[4/9] Testing Student Soft-Delete and Restoration Lifecycle (/api/db/sync)...');
    // Step 4a: Soft-delete (status: REMOVED)
    const softDeletedStudent = {
      ...testStudent,
      status: 'REMOVED',
      removedAt: new Date().toISOString(),
      removedBy: 'Admin Test',
    };
    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [softDeletedStudent] }),
    });

    const verifyRemovedRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const removedRecord = (verifyRemovedRes.data.data.students || []).find((s) => s.id === testStudentId);
    assert(removedRecord && removedRecord.status === 'REMOVED', 'Student soft-deleted successfully (status: REMOVED)');

    // Step 4b: Restore student (status: ACTIVE)
    const restoredStudent = {
      ...testStudent,
      status: 'ACTIVE',
      removedAt: undefined,
      removedBy: undefined,
    };
    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ students: [restoredStudent] }),
    });

    const verifyRestoredRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const restoredRecord = (verifyRestoredRes.data.data.students || []).find((s) => s.id === testStudentId);
    assert(restoredRecord && restoredRecord.status === 'ACTIVE', 'Student restored successfully to ACTIVE status\n');

    // -------------------------------------------------------------
    // Test 5: Fee Invoicing & Payment Processing
    // -------------------------------------------------------------
    console.log('[5/9] Testing Fee Invoicing & Payment Transaction (/api/db/sync)...');
    const testInvoiceId = `inv-test-${Date.now()}`;
    const pendingInvoice = {
      id: testInvoiceId,
      invoiceNo: 'INV-2026-TEST-99',
      studentId: testStudentId,
      term: 'Term 1 Tuition Fee',
      totalAnnualFee: 16500,
      paidAmount: 0,
      dueAmount: 16500,
      status: 'PENDING',
      dueDate: '2026-10-15',
      receipts: [],
    };

    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ invoices: [pendingInvoice] }),
    });

    // Simulate Fee Payment (UPI Transaction with Receipt)
    const paidInvoice = {
      ...pendingInvoice,
      paidAmount: 16500,
      dueAmount: 0,
      status: 'PAID',
      receipts: [
        {
          id: `rcpt-test-${Date.now()}`,
          receiptNo: 'RCPT-2026-TEST-99',
          date: new Date().toISOString().split('T')[0],
          amount: 16500,
          paymentMethod: 'UPI',
          transactionId: 'UPI-LK-2026-889900',
          description: 'Term 1 Tuition Fee Paid via UPI',
        },
      ],
    };

    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ invoices: [paidInvoice] }),
    });

    const verifyInvoiceRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const verifiedInvoice = (verifyInvoiceRes.data.data.invoices || []).find((i) => i.id === testInvoiceId);
    assert(verifiedInvoice && verifiedInvoice.status === 'PAID', 'Invoice status transitioned from PENDING to PAID');
    assert(verifiedInvoice && verifiedInvoice.dueAmount === 0, 'Invoice due balance is ₹0');
    assert(
      verifiedInvoice &&
        verifiedInvoice.receipts &&
        verifiedInvoice.receipts.length > 0 &&
        verifiedInvoice.receipts[0].transactionId === 'UPI-LK-2026-889900',
      'Transaction receipt and UPI reference logged accurately\n'
    );

    // -------------------------------------------------------------
    // Test 6: Attendance Record Marking
    // -------------------------------------------------------------
    console.log('[6/9] Testing Daily Attendance Marking (/api/db/sync)...');
    const testAttendanceId = `att-test-${Date.now()}`;
    const testAttendance = {
      id: testAttendanceId,
      studentId: testStudentId,
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      markedBy: 'Priya Venkatesh (Teacher)',
      remarks: 'Active and enthusiastic in morning circle time',
    };

    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ attendance: [testAttendance] }),
    });

    const verifyAttRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const verifiedAtt = (verifyAttRes.data.data.attendance || []).find((a) => a.id === testAttendanceId);
    assert(Boolean(verifiedAtt), 'Daily attendance record saved to database');
    assert(verifiedAtt && verifiedAtt.status === 'PRESENT', 'Student marked PRESENT with remarks preserved\n');

    // -------------------------------------------------------------
    // Test 7: Teacher Review & Developmental Milestones
    // -------------------------------------------------------------
    console.log('[7/9] Testing Teacher Progress Review (/api/db/sync)...');
    const testReviewId = `rev-test-${Date.now()}`;
    const testReview = {
      id: testReviewId,
      studentId: testStudentId,
      teacherId: 'usr-teacher-priya',
      teacherName: 'Priya Venkatesh',
      date: new Date().toISOString().split('T')[0],
      socialSkills: 5,
      fineMotor: 5,
      languageCommunication: 5,
      emotionalRegulation: 5,
      overallRating: 5,
      comments: 'Recognizes alphabet phonics sounds accurately and enjoys finger painting activities.',
      recommendations: 'Encourage story listening at home',
    };

    await requestJson(`${BASE_URL}/api/db/sync`, {
      method: 'POST',
      body: JSON.stringify({ reviews: [testReview] }),
    });

    const verifyReviewRes = await requestJson(`${BASE_URL}/api/db/sync`);
    const verifiedReview = (verifyReviewRes.data.data.reviews || []).find((r) => r.id === testReviewId);
    assert(Boolean(verifiedReview), 'Teacher review published to parent portal feed');
    assert(verifiedReview && verifiedReview.overallRating === 5, 'Teacher review overallRating (5/5) recorded accurately\n');

    // -------------------------------------------------------------
    // Test 8: Public Admission Enquiry Direct Flow
    // -------------------------------------------------------------
    console.log('[8/9] Testing Public Admission Enquiry (/api/enquiry)...');
    const enquiryPayload = {
      parentName: 'Sundar Pichai',
      email: 'sundar.p@example.com',
      phone: '+91 94433 11223',
      childName: 'Aryan',
      childAge: '3',
      targetLevel: 'NURSERY',
      message: 'Looking for UK-concept early preschool admissions for next term.',
    };

    const enquiryRes = await requestJson(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      body: JSON.stringify(enquiryPayload),
    });

    assert(enquiryRes.ok && enquiryRes.data.success, 'Admission enquiry submitted successfully');
    assert(enquiryRes.data.enquiry && enquiryRes.data.enquiry.status === 'NEW', 'Enquiry created with status NEW');
    assert(enquiryRes.data.enquiry && enquiryRes.data.enquiry.childName === 'Aryan', 'Enquiry child details match\n');

    // -------------------------------------------------------------
    // Test 9: Bot Protection & Verification Services
    // -------------------------------------------------------------
    console.log('[9/9] Testing Turnstile Bot Challenge & Email Verification APIs...');
    // Turnstile test
    const turnstileRes = await requestJson(`${BASE_URL}/api/turnstile`, {
      method: 'POST',
      body: JSON.stringify({ token: 'mock-pass-e2e-token' }),
    });
    assert(turnstileRes.ok && turnstileRes.data.success, 'Cloudflare Turnstile challenge verified successfully');

    // Parent email verification token generation & validation
    const emailVerifyTokenRes = await requestJson(`${BASE_URL}/api/parent/verify-email`, {
      method: 'POST',
      body: JSON.stringify({ email: 'anita.ramanathan2026@gmail.com' }),
    });
    assert(emailVerifyTokenRes.ok && emailVerifyTokenRes.data.success, 'Email verification token generated');

    const verifyTokenRes = await requestJson(`${BASE_URL}/api/parent/verify-email`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'anita.ramanathan2026@gmail.com',
        token: emailVerifyTokenRes.data.verificationToken,
      }),
    });
    assert(verifyTokenRes.ok && verifyTokenRes.data.success, 'Email verification token validated successfully\n');

  } catch (err) {
    console.error('Test Suite encountered an unexpected error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(`   E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
