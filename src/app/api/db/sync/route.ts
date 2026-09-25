import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import {
  UserModel,
  StudentModel,
  AttendanceModel,
  TeacherReviewModel,
  ActivityPostModel,
  StudentResultModel,
  FeeInvoiceModel,
  NoticeModel,
  AdmissionEnquiryModel,
  SchoolSettingsModel,
  AuditLogModel,
  EventPhotoModel,
} from '@/models';
import {
  INITIAL_SETTINGS,
  DEMO_USERS,
  DEMO_STUDENTS,
  DEMO_ATTENDANCE,
  DEMO_REVIEWS,
  DEMO_ACTIVITIES,
  DEMO_RESULTS,
  DEMO_INVOICES,
  DEMO_NOTICES,
  DEMO_ENQUIRIES,
  INITIAL_GALLERY_PHOTOS,
} from '@/lib/initialData';

// Helper to strip internal Mongoose keys from output
function cleanDoc(doc: any) {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  return rest;
}

function cleanDocs(docs: any[]) {
  if (!Array.isArray(docs)) return [];
  return docs.map(cleanDoc);
}

// Helper to bulk upsert by 'id'
async function upsertMany(model: any, items: any[]) {
  if (!Array.isArray(items) || items.length === 0) return;
  const validItems = items.filter((item) => item && typeof item === 'object' && item.id);
  if (validItems.length === 0) return;

  const ops = validItems.map((item) => {
    const { _id, __v, ...cleanItem } = item;
    return {
      updateOne: {
        filter: { id: cleanItem.id },
        update: { $set: cleanItem },
        upsert: true,
      },
    };
  });

  await model.bulkWrite(ops);
}

export async function GET() {
  try {
    await connectToDatabase();

    // 1. School Settings
    let settingsDoc = await SchoolSettingsModel.findOne({ key: 'main_settings' }).lean();
    if (!settingsDoc) {
      const created = await SchoolSettingsModel.create({
        key: 'main_settings',
        ...INITIAL_SETTINGS,
      });
      settingsDoc = created.toObject();
    }
    const settings = cleanDoc(settingsDoc) || INITIAL_SETTINGS;

    // 2. Users (auto-seed users if empty)
    let usersDocs = await UserModel.find({}).lean();
    if (usersDocs.length === 0) {
      await UserModel.insertMany(DEMO_USERS);
      usersDocs = await UserModel.find({}).lean();
    }
    const users = cleanDocs(usersDocs);

    // 3. Other Collections
    let [
      studentsDocs,
      attendanceDocs,
      reviewsDocs,
      activitiesDocs,
      resultsDocs,
      invoicesDocs,
      noticesDocs,
      enquiriesDocs,
    ] = await Promise.all([
      StudentModel.find({}).lean(),
      AttendanceModel.find({}).lean(),
      TeacherReviewModel.find({}).lean(),
      ActivityPostModel.find({}).lean(),
      StudentResultModel.find({}).lean(),
      FeeInvoiceModel.find({}).lean(),
      NoticeModel.find({}).lean(),
      AdmissionEnquiryModel.find({}).lean(),
      EventPhotoModel.find({}).lean(),
    ]);

    const auditLogsDocs = await AuditLogModel.find({}).lean();

    // Auto-seed collections if empty
    if (studentsDocs.length === 0 && DEMO_STUDENTS.length > 0) {
      await StudentModel.insertMany(DEMO_STUDENTS);
      studentsDocs = await StudentModel.find({}).lean();
    }

    if (attendanceDocs.length === 0 && DEMO_ATTENDANCE.length > 0) {
      await AttendanceModel.insertMany(DEMO_ATTENDANCE);
      attendanceDocs = await AttendanceModel.find({}).lean();
    }

    if (reviewsDocs.length === 0 && DEMO_REVIEWS.length > 0) {
      await TeacherReviewModel.insertMany(DEMO_REVIEWS);
      reviewsDocs = await TeacherReviewModel.find({}).lean();
    }

    if (activitiesDocs.length === 0 && DEMO_ACTIVITIES.length > 0) {
      await ActivityPostModel.insertMany(DEMO_ACTIVITIES);
      activitiesDocs = await ActivityPostModel.find({}).lean();
    }

    if (resultsDocs.length === 0 && DEMO_RESULTS.length > 0) {
      await StudentResultModel.insertMany(DEMO_RESULTS);
      resultsDocs = await StudentResultModel.find({}).lean();
    }

    if (invoicesDocs.length === 0 && DEMO_INVOICES.length > 0) {
      await FeeInvoiceModel.insertMany(DEMO_INVOICES);
      invoicesDocs = await FeeInvoiceModel.find({}).lean();
    }

    if (noticesDocs.length === 0 && DEMO_NOTICES.length > 0) {
      await NoticeModel.insertMany(DEMO_NOTICES);
      noticesDocs = await NoticeModel.find({}).lean();
    }

    if (enquiriesDocs.length === 0 && DEMO_ENQUIRIES.length > 0) {
      await AdmissionEnquiryModel.insertMany(DEMO_ENQUIRIES);
      enquiriesDocs = await AdmissionEnquiryModel.find({}).lean();
    }

    let galleryDocs = arguments ? (arguments as any) : null;
    // Auto-seed gallery if empty
    let currentGalleryDocs = await EventPhotoModel.find({}).lean();
    if (currentGalleryDocs.length === 0 && INITIAL_GALLERY_PHOTOS.length > 0) {
      await EventPhotoModel.insertMany(INITIAL_GALLERY_PHOTOS);
      currentGalleryDocs = await EventPhotoModel.find({}).lean();
    }



    return NextResponse.json({
      success: true,
      data: {
        settings,
        users,
        students: cleanDocs(studentsDocs),
        attendance: cleanDocs(attendanceDocs),
        reviews: cleanDocs(reviewsDocs),
        activities: cleanDocs(activitiesDocs),
        results: cleanDocs(resultsDocs),
        invoices: cleanDocs(invoicesDocs),
        notices: cleanDocs(noticesDocs),
        enquiries: cleanDocs(enquiriesDocs),
        auditLogs: cleanDocs(auditLogsDocs),
        gallery: cleanDocs(currentGalleryDocs),
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to GET /api/db/sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve database records.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const tasks: Promise<any>[] = [];

    // Settings
    if (body.settings && typeof body.settings === 'object') {
      const { _id, __v, ...cleanSettings } = body.settings;
      tasks.push(
        SchoolSettingsModel.findOneAndUpdate(
          { key: 'main_settings' },
          { $set: cleanSettings },
          { upsert: true, new: true }
        )
      );
    }

    // Collections upsert
    if (body.users) tasks.push(upsertMany(UserModel, body.users));
    if (body.students) tasks.push(upsertMany(StudentModel, body.students));
    if (body.attendance) tasks.push(upsertMany(AttendanceModel, body.attendance));
    if (body.reviews) tasks.push(upsertMany(TeacherReviewModel, body.reviews));
    if (body.activities) tasks.push(upsertMany(ActivityPostModel, body.activities));
    if (body.results) tasks.push(upsertMany(StudentResultModel, body.results));
    if (body.invoices) tasks.push(upsertMany(FeeInvoiceModel, body.invoices));
    if (body.notices) tasks.push(upsertMany(NoticeModel, body.notices));
    if (body.enquiries) tasks.push(upsertMany(AdmissionEnquiryModel, body.enquiries));
    if (body.auditLogs) tasks.push(upsertMany(AuditLogModel, body.auditLogs));
    if (body.gallery) tasks.push(upsertMany(EventPhotoModel, body.gallery));

    await Promise.all(tasks);

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to POST /api/db/sync:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to synchronize records with database.',
      },
      { status: 500 }
    );
  }
}
