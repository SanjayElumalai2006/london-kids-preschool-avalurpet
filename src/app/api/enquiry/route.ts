import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { AdmissionEnquiryModel } from '@/models';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      parentName,
      email,
      phone,
      childName,
      childAge,
      targetLevel,
      message,
      submittedAt,
      status,
    } = body;

    if (!parentName || !email || !phone || !childName || !childAge || !targetLevel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required enquiry fields (parentName, email, phone, childName, childAge, targetLevel).',
        },
        { status: 400 }
      );
    }

    const validLevels = ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'];
    if (!validLevels.includes(targetLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid school level. Allowed: ${validLevels.join(', ')}`,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const enquiryId = id || `enq-${Date.now()}`;
    const timestamp =
      submittedAt ||
      new Date().toLocaleString('en-IN', {
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
          parentName: parentName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          childName: childName.trim(),
          childAge: childAge.trim(),
          targetLevel,
          message: (message || '').trim(),
          submittedAt: timestamp,
          status: status || 'NEW',
        },
      },
      { upsert: true, new: true, lean: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Admission enquiry saved successfully.',
      enquiry,
    });
  } catch (error: any) {
    console.error('Failed to POST /api/enquiry:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit admission enquiry.',
      },
      { status: 500 }
    );
  }
}
