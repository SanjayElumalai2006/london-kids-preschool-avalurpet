import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { AdmissionEnquiryModel, AuditLogModel } from '@/models';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: 5 submissions per 15 mins per IP
    const rateCheck = checkRateLimit(`enquiry:${clientIp}`, 5, 15 * 60 * 1000);
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

    const cleanParentName = String(parentName).trim().slice(0, 100);
    const cleanEmail = String(email).trim().toLowerCase().slice(0, 120);
    const cleanPhone = String(phone).trim().slice(0, 20);
    const cleanChildName = String(childName).trim().slice(0, 100);
    const cleanChildAge = String(childAge).trim().slice(0, 50);
    const cleanMessage = String(message || '').trim().slice(0, 1000);
    const cleanEnquiryType = String(enquiryType || 'ADMISSION_INFO').trim();

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
