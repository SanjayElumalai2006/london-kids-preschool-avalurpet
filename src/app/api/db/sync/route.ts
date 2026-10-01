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
import { getSessionUser } from '@/lib/session';
import { hashPasswordSync } from '@/lib/security';

// Helper to strip internal Mongoose keys and sensitive credentials
function cleanDoc(doc: any) {
  if (!doc) return null;
  const { _id, __v, password, passwordHash, resetPasswordCode, resetCodeExpires, ...rest } = doc;
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

export async function GET(request: Request) {
  try {
    // 1. Enforce Server-Side Authorization: Session Required
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Active user session required to synchronize database records.',
        },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const userRole = session.role;
    const parentLinkedIds = session.studentIds || [];

    // 2. School Settings
    let settingsDoc = await SchoolSettingsModel.findOne({ key: 'main_settings' }).lean();
    if (!settingsDoc) {
      const created = await SchoolSettingsModel.create({
        key: 'main_settings',
        ...INITIAL_SETTINGS,
      });
      settingsDoc = created.toObject();
    }
    const settings = cleanDoc(settingsDoc) || INITIAL_SETTINGS;

    // 3. Auto-seed if database is fresh
    const userCount = await UserModel.countDocuments();
    if (userCount === 0 && DEMO_USERS.length > 0) {
      await UserModel.insertMany(DEMO_USERS);
    }

    const studentCount = await StudentModel.countDocuments();
    if (studentCount === 0 && DEMO_STUDENTS.length > 0) {
      await StudentModel.insertMany(DEMO_STUDENTS);
    }

    const galleryCount = await EventPhotoModel.countDocuments();
    if (galleryCount === 0 && INITIAL_GALLERY_PHOTOS.length > 0) {
      await EventPhotoModel.insertMany(INITIAL_GALLERY_PHOTOS);
    }

    // 4. Role-Based Scoped Queries
    let studentsDocs: any[] = [];
    let attendanceDocs: any[] = [];
    let reviewsDocs: any[] = [];
    let activitiesDocs: any[] = [];
    let resultsDocs: any[] = [];
    let invoicesDocs: any[] = [];
    let noticesDocs: any[] = [];
    let enquiriesDocs: any[] = [];
    let usersDocs: any[] = [];
    let auditLogsDocs: any[] = [];

    if (userRole === 'PARENT' || userRole === 'STUDENT') {
      // PARENTS CAN ONLY RETRIEVE THEIR OWN LINKED CHILDREN
      studentsDocs = await StudentModel.find({
        id: { $in: parentLinkedIds },
        status: { $ne: 'REMOVED' },
      }).lean();

      attendanceDocs = await AttendanceModel.find({
        studentId: { $in: parentLinkedIds },
      }).lean();

      reviewsDocs = await TeacherReviewModel.find({
        studentId: { $in: parentLinkedIds },
      }).lean();

      resultsDocs = await StudentResultModel.find({
        studentId: { $in: parentLinkedIds },
      }).lean();

      invoicesDocs = await FeeInvoiceModel.find({
        studentId: { $in: parentLinkedIds },
      }).lean();

      const studentLevels = studentsDocs.map((s) => s.level);
      activitiesDocs = await ActivityPostModel.find({
        $or: [{ level: 'ALL' }, { level: { $in: studentLevels } }],
      }).lean();

      noticesDocs = await NoticeModel.find({
        $or: [{ targetLevel: 'ALL' }, { targetLevel: { $in: studentLevels } }],
      }).lean();

      // Only their own user profile
      usersDocs = await UserModel.find({ id: session.userId }).lean();
      // Zero exposure of audit logs or enquiries
      auditLogsDocs = [];
      enquiriesDocs = [];
    } else if (userRole === 'STAFF' || userRole === 'TEACHER') {
      // Teachers and staff get classroom data; invoices & full user directories are restricted
      [studentsDocs, attendanceDocs, reviewsDocs, activitiesDocs, resultsDocs, noticesDocs] =
        await Promise.all([
          StudentModel.find({ status: { $ne: 'REMOVED' } }).lean(),
          AttendanceModel.find({}).lean(),
          TeacherReviewModel.find({}).lean(),
          ActivityPostModel.find({}).lean(),
          StudentResultModel.find({}).lean(),
          NoticeModel.find({}).lean(),
        ]);

      // Staff only sees staff/teachers directory for contact, never parents or full directory
      usersDocs = await UserModel.find({
        role: { $in: ['TEACHER', 'STAFF', 'ADMIN', 'PRINCIPAL'] },
        status: 'ACTIVE',
      }).lean();

      invoicesDocs = []; // Confidential
      auditLogsDocs = []; // Restricted to Owner/Admin
      enquiriesDocs = [];
    } else {
      // ADMIN, PRINCIPAL, OWNER: Full operational and financial management access
      [
        studentsDocs,
        attendanceDocs,
        reviewsDocs,
        activitiesDocs,
        resultsDocs,
        invoicesDocs,
        noticesDocs,
        enquiriesDocs,
        usersDocs,
        auditLogsDocs,
      ] = await Promise.all([
        StudentModel.find({}).lean(),
        AttendanceModel.find({}).lean(),
        TeacherReviewModel.find({}).lean(),
        ActivityPostModel.find({}).lean(),
        StudentResultModel.find({}).lean(),
        FeeInvoiceModel.find({}).lean(),
        NoticeModel.find({}).lean(),
        AdmissionEnquiryModel.find({}).lean(),
        UserModel.find({}).lean(),
        AuditLogModel.find({}).sort({ timestamp: -1 }).limit(100).lean(),
      ]);
    }

    const currentGalleryDocs = await EventPhotoModel.find({}).lean();

    return NextResponse.json({
      success: true,
      data: {
        settings,
        users: cleanDocs(usersDocs), // Sensitive credentials completely stripped
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
    // 1. Enforce Server-Side Authorization: Session Required
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Active user session required to modify database records.',
        },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const userRole = session.role;
    const parentLinkedIds = session.studentIds || [];
    const tasks: Promise<any>[] = [];

    // 2. Role-based mutation boundaries
    if (userRole === 'PARENT' || userRole === 'STUDENT') {
      // Parents can only update their own linked children's photo or profile details
      if (body.students && Array.isArray(body.students)) {
        const allowedStudentUpdates = body.students.filter((s: any) =>
          parentLinkedIds.includes(s.id)
        );
        if (allowedStudentUpdates.length > 0) {
          tasks.push(upsertMany(StudentModel, allowedStudentUpdates));
        }
      }
      // Reject any attempt by a parent to modify other collections
    } else if (userRole === 'STAFF') {
      // Staff can update attendance, notices, transport
      if (body.attendance) tasks.push(upsertMany(AttendanceModel, body.attendance));
      if (body.notices) tasks.push(upsertMany(NoticeModel, body.notices));
    } else if (userRole === 'TEACHER') {
      // Teachers can update attendance, reviews, activities, notices, results, event photos
      if (body.attendance) tasks.push(upsertMany(AttendanceModel, body.attendance));
      if (body.reviews) tasks.push(upsertMany(TeacherReviewModel, body.reviews));
      if (body.activities) tasks.push(upsertMany(ActivityPostModel, body.activities));
      if (body.results) tasks.push(upsertMany(StudentResultModel, body.results));
      if (body.notices) tasks.push(upsertMany(NoticeModel, body.notices));
      if (body.gallery) tasks.push(upsertMany(EventPhotoModel, body.gallery));
    } else if (['ADMIN', 'PRINCIPAL', 'OWNER'].includes(userRole)) {
      // Administrative roles
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

      // Safe Users upsert with password hashing and privilege escalation protection
      if (body.users && Array.isArray(body.users)) {
        const sanitizedUsers = body.users.map((u: any) => {
          const userCopy = { ...u };
          // If a new raw password was supplied during user creation/reset
          if (userCopy.password && !userCopy.passwordHash) {
            userCopy.passwordHash = hashPasswordSync(userCopy.password);
            delete userCopy.password;
          }
          // Prevent non-OWNER from creating or escalating to OWNER
          if (userRole !== 'OWNER' && userCopy.role === 'OWNER') {
            userCopy.role = 'ADMIN';
          }
          return userCopy;
        });
        tasks.push(upsertMany(UserModel, sanitizedUsers));
      }

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
    }

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
