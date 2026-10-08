import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { AdmissionEnquiryModel, AuditLogModel } from '@/models';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin, sanitizeText, sanitizeEmail, sanitizePhone } from '@/lib/security';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // 0. CSRF & Origin Allowlist Check
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Untrusted request origin.' },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);

    // 1. Distributed Rate Limiting: 5 submissions per 15 mins per IP
    const rateCheck = await checkRateLimitAsync(`enquiry:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many admission enquiries submitted. Please wait ${rateCheck.resetInSec} seconds before submitting another.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      id,
      parentName,
      email,
      phone,
      childName,
      childAge,
      targetLevel,
      enquiryType,
      message,
      turnstileToken,
    } = body;

    // 2. Validate Turnstile Security Challenge
    // Verify token server-side
    const turnstileResult = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Security challenge failed or expired. Please verify the captcha and try again.',
        },
        { status: 400 }
      );
    }

    // 3. Field Validations
    if (!parentName || !email || !phone || !childName || !childAge || !targetLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please complete all required fields: parent name, email, phone number, child name, age, and program level.',
        },
        { status: 400 }
      );
    }

    const cleanParentName = sanitizeText(parentName, 100);
    const cleanEmail = sanitizeEmail(email);
    const cleanPhone = sanitizePhone(phone);
    const cleanChildName = sanitizeText(childName, 100);
    const cleanChildAge = sanitizeText(childAge, 50);
    const cleanMessage = sanitizeText(message || '', 1000);
    const cleanEnquiryType = sanitizeText(enquiryType || 'ADMISSION_INFO', 50);

    if (cleanParentName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Parent name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    if (cleanChildName.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Child name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address (e.g. parent@example.com).' },
        { status: 400 }
      );
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number for admissions contact.' },
        { status: 400 }
      );
    }

    const validLevels = ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'];
    if (!validLevels.includes(targetLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid program level. Allowed: ${validLevels.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // 4. Persistence to MongoDB
    await connectToDatabase();

    const enquiryId = id || `enq-${Date.now()}`;
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const enquiry = await AdmissionEnquiryModel.findOneAndUpdate(
      { id: enquiryId },
      {
        $set: {
          id: enquiryId,
          parentName: cleanParentName,
          email: cleanEmail,
          phone: cleanPhone,
          childName: cleanChildName,
          childAge: cleanChildAge,
          targetLevel,
          enquiryType: cleanEnquiryType,
          message: cleanMessage,
          submittedAt: timestamp,
          status: 'NEW',
        },
      },
      { upsert: true, returnDocument: 'after', lean: true }
    );

    // 5. Safe Audit Log
    try {
      await AuditLogModel.create({
        id: `aud-${Date.now()}`,
        action: 'ENQUIRY_SUBMITTED',
        targetUserId: enquiryId,
        targetUserName: cleanChildName,
        targetUserRole: 'PARENT',
        performedBy: 'public-visitor',
        performedByName: cleanParentName,
        details: `Public enquiry for ${cleanChildName} (${targetLevel}) submitted by ${cleanParentName}`,
        timestamp: new Date().toISOString(),
      });
    } catch {}

    const { _id, __v, ...cleanEnquiryDoc } = enquiry as any;

    return NextResponse.json({
      success: true,
      message: 'Admission enquiry received and saved successfully.',
      enquiry: cleanEnquiryDoc,
    });
  } catch (error: any) {
    console.error('Failed to POST /api/enquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit admission enquiry. Please try again or contact +91 90436 33545 directly.',
      },
      { status: 500 }
    );
  }
}
