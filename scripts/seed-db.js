/**
 * London Kids Preschool Avalurpet - MongoDB Complete Preschool Seeder & Revival Script
 * 
 * Populates complete, realistic sample data for the preschool across all 11 collections:
 * - schoolsettings (Preschool branding, contact, academic year 2026-2027, timing, fees)
 * - users (Director, Teachers for Play School/Nursery/LKG/UKG, Parents)
 * - students (Enrolled students across Play School, Nursery, LKG, and UKG)
 * - attendances (Daily attendance records)
 * - feeinvoices (Tuition invoices with payment receipts)
 * - teacherreviews (Developmental milestone reviews)
 * - studentresults (Term 1 evaluations & skill grades)
 * - notices (Admissions circular, welcome announcement)
 * - activityposts (Sensory play, phonics adventure)
 * - admissionenquiries (Website admissions inquiry)
 * - auditlogs
 * 
 * Usage:
 *   node scripts/seed-db.js
 *   npm run db:seed
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Helper to load .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx !== -1) {
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/londonkids_preschool';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 1. School Settings
const INITIAL_SETTINGS = {
  key: 'main_settings',
  schoolName: 'London Kids Preschool Avalurpet',
  tagline: 'Nurturing Little Minds with Love, Play & Wonder',
  address: 'Main Road, Near Bus Stand, Avalurpet',
  cityState: 'Avalurpet, Tamil Nadu – 606 702',
  phone: '+91 90436 33545',
  email: 'londonkidsavalurpet@gmail.com',
  registrationNo: 'PRE-2024-TN-8842',
  academicYear: '2026-2027',
  timings: '8:30 AM - 1:30 PM (Extended care till 5:00 PM)',
  fees: {
    PLAY_SCHOOL: 18000,
    NURSERY: 22000,
    LKG: 26000,
    UKG: 30000,
  },
};

// 2. Users (Director, Teachers, Parents)
const INITIAL_USERS = [
  // Director / Owner
  {
    id: 'user-owner-londonkids',
    name: 'School Director',
    email: 'londonkids276@gmail.com',
    personalEmail: 'londonkids276@gmail.com',
    role: 'OWNER',
    phone: '+91 90436 33545',
    employeeId: 'EMP-LK-OWNER',
    address: 'Main Road, Avalurpet, Tamil Nadu – 606 702',
    dateOfJoining: '2024-01-01',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('90436 33545'),
    emailVerified: true,
    mustChangePassword: false,
  },
  // Teacher 1: Play School & Nursery
  {
    id: 'user-teacher-kavitha',
    name: 'Mrs. Kavitha Raman',
    email: 'kavitha.lk@gmail.com',
    personalEmail: 'kavitha.lk@gmail.com',
    role: 'TEACHER',
    phone: '+91 98401 23456',
    employeeId: 'EMP-LK-T01',
    assignedClass: 'PLAY_SCHOOL',
    assignedSection: 'A',
    address: 'Gandhi Street, Avalurpet, Tamil Nadu',
    dateOfJoining: '2024-06-01',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('teacher123'),
    emailVerified: true,
    mustChangePassword: false,
  },
  // Teacher 2: LKG & UKG
  {
    id: 'user-teacher-priya',
    name: 'Ms. Priya Sundaram',
    email: 'priya.lk@gmail.com',
    personalEmail: 'priya.lk@gmail.com',
    role: 'TEACHER',
    phone: '+91 98402 34567',
    employeeId: 'EMP-LK-T02',
    assignedClass: 'LKG',
    assignedSection: 'A',
    address: 'Temple View Road, Avalurpet, Tamil Nadu',
    dateOfJoining: '2024-06-01',
    photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('teacher123'),
    emailVerified: true,
    mustChangePassword: false,
  },
  // Parent 1: Rajesh Kumar (Parent of Aarav)
  {
    id: 'user-parent-rajesh',
    name: 'Mr. Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    personalEmail: 'rajesh.kumar@gmail.com',
    role: 'PARENT',
    phone: '+91 97890 12345',
    address: 'Bazaar Street, Avalurpet, Tamil Nadu',
    dateOfJoining: '2026-06-01',
    studentIds: ['student-lk-ps-01'],
    studentId: 'student-lk-ps-01',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('parent123'),
    emailVerified: true,
    mustChangePassword: false,
  },
  // Parent 2: Mrs. Deepa Lakshmi (Parent of Advait & Ananya)
  {
    id: 'user-parent-deepa',
    name: 'Mrs. Deepa Lakshmi',
    email: 'deepa.lakshmi@gmail.com',
    personalEmail: 'deepa.lakshmi@gmail.com',
    role: 'PARENT',
    phone: '+91 97890 23456',
    address: 'Post Office Lane, Avalurpet, Tamil Nadu',
    dateOfJoining: '2026-06-01',
    studentIds: ['student-lk-nur-01', 'student-lk-lkg-01'],
    studentId: 'student-lk-nur-01',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('parent123'),
    emailVerified: true,
    mustChangePassword: false,
  },
  // Parent 3: Murugan K (Parent of Diya)
  {
    id: 'user-parent-murugan',
    name: 'Mr. Murugan K',
    email: 'murugan.k@gmail.com',
    personalEmail: 'murugan.k@gmail.com',
    role: 'PARENT',
    phone: '+91 97890 34567',
    address: 'Lake View Nagar, Avalurpet, Tamil Nadu',
    dateOfJoining: '2026-06-01',
    studentIds: ['student-lk-ukg-01'],
    studentId: 'student-lk-ukg-01',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    createdAt: '2026-09-19',
    updatedAt: '2026-09-19',
    passwordHash: hashPassword('parent123'),
    emailVerified: true,
    mustChangePassword: false,
  },
];

// 3. Students (Enrolled across Play School, Nursery, LKG, UKG)
const INITIAL_STUDENTS = [
  {
    id: 'student-lk-ps-01',
    admissionNo: 'LK-2026-001',
    name: 'Aarav Kumar',
    dob: '2023-04-12',
    gender: 'Male',
    level: 'PLAY_SCHOOL',
    section: 'A',
    rollNo: '01',
    bloodGroup: 'B+',
    photo: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    parentId: 'user-parent-rajesh',
    parentName: 'Rajesh Kumar',
    parentPhone: '+91 97890 12345',
    parentEmail: 'rajesh.kumar@gmail.com',
    teacherId: 'user-teacher-kavitha',
    teacherName: 'Mrs. Kavitha Raman',
    emergencyContact: '+91 97890 12345',
    medicalNotes: 'No known allergies',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'student-lk-nur-01',
    admissionNo: 'LK-2026-002',
    name: 'Advait Lakshmi',
    dob: '2022-08-15',
    gender: 'Male',
    level: 'NURSERY',
    section: 'A',
    rollNo: '01',
    bloodGroup: 'O+',
    photo: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=150&auto=format&fit=crop&q=80',
    parentId: 'user-parent-deepa',
    parentName: 'Mrs. Deepa Lakshmi',
    parentPhone: '+91 97890 23456',
    parentEmail: 'deepa.lakshmi@gmail.com',
    teacherId: 'user-teacher-kavitha',
    teacherName: 'Mrs. Kavitha Raman',
    emergencyContact: '+91 97890 23456',
    medicalNotes: 'None',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'student-lk-lkg-01',
    admissionNo: 'LK-2026-003',
    name: 'Ananya Lakshmi',
    dob: '2021-11-20',
    gender: 'Female',
    level: 'LKG',
    section: 'A',
    rollNo: '01',
    bloodGroup: 'A+',
    photo: 'https://images.unsplash.com/photo-1595454223600-91fbdd7ce51a?w=150&auto=format&fit=crop&q=80',
    parentId: 'user-parent-deepa',
    parentName: 'Mrs. Deepa Lakshmi',
    parentPhone: '+91 97890 23456',
    parentEmail: 'deepa.lakshmi@gmail.com',
    teacherId: 'user-teacher-priya',
    teacherName: 'Ms. Priya Sundaram',
    emergencyContact: '+91 97890 23456',
    medicalNotes: 'Mild dust allergy',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
  {
    id: 'student-lk-ukg-01',
    admissionNo: 'LK-2026-004',
    name: 'Diya Murugan',
    dob: '2020-09-05',
    gender: 'Female',
    level: 'UKG',
    section: 'A',
    rollNo: '01',
    bloodGroup: 'O+',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    parentId: 'user-parent-murugan',
    parentName: 'Murugan K',
    parentPhone: '+91 97890 34567',
    parentEmail: 'murugan.k@gmail.com',
    teacherId: 'user-teacher-priya',
    teacherName: 'Ms. Priya Sundaram',
    emergencyContact: '+91 97890 34567',
    medicalNotes: 'None',
    admissionDate: '2026-06-01',
    status: 'ACTIVE',
    createdAt: '2026-06-01',
    updatedAt: '2026-06-01',
  },
];

// 4. Daily Attendance Records
const INITIAL_ATTENDANCE = [
  {
    id: 'att-ps-01',
    studentId: 'student-lk-ps-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Cheerfully participated in sensory play',
    markedBy: 'Mrs. Kavitha Raman',
  },
  {
    id: 'att-nur-01',
    studentId: 'student-lk-nur-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Active in story time session',
    markedBy: 'Mrs. Kavitha Raman',
  },
  {
    id: 'att-lkg-01',
    studentId: 'student-lk-lkg-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Excellent focus during phonics tracing',
    markedBy: 'Ms. Priya Sundaram',
  },
  {
    id: 'att-ukg-01',
    studentId: 'student-lk-ukg-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Led morning circle greeting',
    markedBy: 'Ms. Priya Sundaram',
  },
];

// 5. Fee Invoices and Receipts
const INITIAL_INVOICES = [
  {
    id: 'inv-lk-001',
    studentId: 'student-lk-ps-01',
    invoiceNo: 'INV-2026-001',
    totalAnnualFee: 18000,
    paidAmount: 18000,
    dueAmount: 0,
    dueDate: '2026-07-15',
    status: 'PAID',
    term: 'Annual / Term 1',
    receipts: [
      {
        id: 'rcp-lk-001',
        receiptNo: 'RCP-2026-001',
        date: '2026-06-05',
        amount: 18000,
        paymentMethod: 'UPI',
        transactionId: 'UPI-9840182746',
        description: 'Annual tuition fee paid in full',
      },
    ],
  },
  {
    id: 'inv-lk-002',
    studentId: 'student-lk-nur-01',
    invoiceNo: 'INV-2026-002',
    totalAnnualFee: 22000,
    paidAmount: 11000,
    dueAmount: 11000,
    dueDate: '2026-09-30',
    status: 'PENDING',
    term: 'Term 1',
    receipts: [
      {
        id: 'rcp-lk-002',
        receiptNo: 'RCP-2026-002',
        date: '2026-06-10',
        amount: 11000,
        paymentMethod: 'NETBANKING',
        transactionId: 'NB-20260610992',
        description: 'First installment tuition fee',
      },
    ],
  },
  {
    id: 'inv-lk-003',
    studentId: 'student-lk-lkg-01',
    invoiceNo: 'INV-2026-003',
    totalAnnualFee: 26000,
    paidAmount: 26000,
    dueAmount: 0,
    dueDate: '2026-07-15',
    status: 'PAID',
    term: 'Annual / Term 1',
    receipts: [
      {
        id: 'rcp-lk-003',
        receiptNo: 'RCP-2026-003',
        date: '2026-06-10',
        amount: 26000,
        paymentMethod: 'UPI',
        transactionId: 'UPI-8849182345',
        description: 'Full annual preschool fee paid via GPay',
      },
    ],
  },
  {
    id: 'inv-lk-004',
    studentId: 'student-lk-ukg-01',
    invoiceNo: 'INV-2026-004',
    totalAnnualFee: 30000,
    paidAmount: 15000,
    dueAmount: 15000,
    dueDate: '2026-09-30',
    status: 'PENDING',
    term: 'Term 1',
    receipts: [
      {
        id: 'rcp-lk-004',
        receiptNo: 'RCP-2026-004',
        date: '2026-06-12',
        amount: 15000,
        paymentMethod: 'CASH',
        transactionId: 'CASH-REC-004',
        description: 'First term fee cash counter payment',
      },
    ],
  },
];

// 6. Teacher Developmental Milestone Reviews
const INITIAL_REVIEWS = [
  {
    id: 'rev-lk-001',
    studentId: 'student-lk-ps-01',
    teacherId: 'user-teacher-kavitha',
    teacherName: 'Mrs. Kavitha Raman',
    date: '2026-09-20',
    socialSkills: 5,
    fineMotor: 4,
    languageCommunication: 4,
    emotionalRegulation: 5,
    overallRating: 5,
    comments: 'Aarav is an absolute joy in Play School. He interacts delightfully during sensory play, shares toys readily, and is picking up vocabulary very quickly.',
    recommendations: 'Encourage rhyming songs and bedtime book reading at home.',
  },
  {
    id: 'rev-lk-002',
    studentId: 'student-lk-lkg-01',
    teacherId: 'user-teacher-priya',
    teacherName: 'Ms. Priya Sundaram',
    date: '2026-09-20',
    socialSkills: 5,
    fineMotor: 5,
    languageCommunication: 5,
    emotionalRegulation: 4,
    overallRating: 5,
    comments: 'Ananya excels in phonics and letter tracing. She loves group storytelling and displays wonderful empathy and leadership among peers.',
    recommendations: 'Continue practicing simple number sequencing up to 50.',
  },
];

// 7. Student Results & Term Evaluations
const INITIAL_RESULTS = [
  {
    id: 'res-lk-001',
    studentId: 'student-lk-lkg-01',
    term: 'Term 1',
    academicYear: '2026-2027',
    date: '2026-09-21',
    skills: [
      { skillName: 'Phonics & Alphabet Recognition', grade: 'Excellent', score: 95 },
      { skillName: 'Number Concepts & Counting', grade: 'Excellent', score: 92 },
      { skillName: 'Coloring & Motor Coordination', grade: 'Very Good', score: 88 },
      { skillName: 'Social Interaction & Sharing', grade: 'Excellent', score: 96 },
    ],
    attendancePercentage: 98,
    teacherRemark: 'Outstanding performance and cheerful attitude throughout the term!',
    promotedToNextGrade: true,
  },
  {
    id: 'res-lk-002',
    studentId: 'student-lk-ukg-01',
    term: 'Term 1',
    academicYear: '2026-2027',
    date: '2026-09-21',
    skills: [
      { skillName: 'Sentence Reading & Phonics', grade: 'Excellent', score: 94 },
      { skillName: 'Basic Addition & Patterns', grade: 'Excellent', score: 96 },
      { skillName: 'Drawing & Crafting', grade: 'Very Good', score: 90 },
      { skillName: 'Physical Play & Sportsmanship', grade: 'Excellent', score: 95 },
    ],
    attendancePercentage: 97,
    teacherRemark: 'Confident speaker and enthusiastic learner in all classroom activities.',
    promotedToNextGrade: true,
  },
];

// 8. Notices
const INITIAL_NOTICES = [
  {
    id: 'notice-admissions-2026',
    title: 'Admissions Open for Academic Year 2026-2027',
    content: 'Admissions are now open for Play Group, Nursery, LKG, and UKG for the upcoming academic year 2026-2027. Parents are warmly invited to visit our preschool campus or register online.',
    targetLevel: 'ALL',
    date: '2026-09-20',
    authorName: 'School Director',
    priority: 'HIGH',
    category: 'Circular',
  },
  {
    id: 'notice-welcome-session',
    title: 'Welcome to London Kids Preschool Avalurpet',
    content: 'We welcome all parents and children to our vibrant learning community! Our curriculum combines UK-standard early childhood development with playful sensory exploration.',
    targetLevel: 'ALL',
    date: '2026-09-21',
    authorName: 'School Director',
    priority: 'NORMAL',
    category: 'Event',
  },
];

// 9. Activity Posts
const INITIAL_ACTIVITIES = [
  {
    id: 'act-arts-crafts-1',
    level: 'PLAY_SCHOOL',
    title: 'Color Splash & Sensory Finger Painting',
    description: 'Our play group and nursery kids had a wonderful sensory experience exploring vibrant colors and developing fine motor skills!',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    category: 'Arts & Crafts',
    createdBy: 'School Director',
  },
  {
    id: 'act-story-phonics-1',
    level: 'LKG',
    title: 'Story Time & Phonics Adventure',
    description: 'Engaging phonics exploration and puppet storytelling session fostering early language skills and creative imagination.',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    category: 'Story & Phonics',
    createdBy: 'School Director',
  },
];

// 10. Admission Enquiries
const INITIAL_ENQUIRIES = [
  {
    id: 'enq-sample-001',
    parentName: 'Suresh Balaji',
    email: 'suresh.b@gmail.com',
    phone: '+91 94441 55678',
    childName: 'Kavin Suresh',
    childAge: '2.5 Years',
    targetLevel: 'PLAY_SCHOOL',
    message: 'Interested in enrolling our son for play group starting next month. Please share campus visiting hours.',
    submittedAt: '2026-09-22T10:30:00Z',
    status: 'CONTACTED',
  },
  {
    id: 'enq-sample-002',
    parentName: 'Meenakshi Sundar',
    email: 'meenakshi.s@gmail.com',
    phone: '+91 94442 66789',
    childName: 'Rithanya Sundar',
    childAge: '3.8 Years',
    targetLevel: 'LKG',
    message: 'Looking for LKG admission for our daughter. Would like to know about bus transportation facility in Avalurpet.',
    submittedAt: '2026-09-23T08:15:00Z',
    status: 'NEW',
  },
];

const ALL_COLLECTIONS = [
  'schoolsettings',
  'users',
  'students',
  'attendances',
  'teacherreviews',
  'activityposts',
  'studentresults',
  'feeinvoices',
  'notices',
  'admissionenquiries',
  'auditlogs',
];

async function seedDatabase() {
  console.log('🔄 Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB successfully!\n');

  const db = mongoose.connection.db;

  // 1. Ensure all collections exist
  const existingColls = (await db.listCollections().toArray()).map((c) => c.name);
  for (const collName of ALL_COLLECTIONS) {
    if (!existingColls.includes(collName)) {
      await db.createCollection(collName);
      console.log(` ✨ Created collection: "${collName}"`);
    }
  }

  // 2. Upsert School Settings
  await db.collection('schoolsettings').updateOne(
    { key: 'main_settings' },
    { $set: INITIAL_SETTINGS },
    { upsert: true }
  );

  // 3. Upsert Users
  const usersColl = db.collection('users');
  for (const user of INITIAL_USERS) {
    await usersColl.updateOne({ id: user.id }, { $set: user }, { upsert: true });
  }

  // 4. Upsert Students
  const studentsColl = db.collection('students');
  for (const student of INITIAL_STUDENTS) {
    await studentsColl.updateOne({ id: student.id }, { $set: student }, { upsert: true });
  }

  // 5. Upsert Attendance
  const attColl = db.collection('attendances');
  for (const att of INITIAL_ATTENDANCE) {
    await attColl.updateOne({ id: att.id }, { $set: att }, { upsert: true });
  }

  // 6. Upsert Fee Invoices
  const invColl = db.collection('feeinvoices');
  for (const inv of INITIAL_INVOICES) {
    await invColl.updateOne({ id: inv.id }, { $set: inv }, { upsert: true });
  }

  // 7. Upsert Teacher Reviews
  const revColl = db.collection('teacherreviews');
  for (const rev of INITIAL_REVIEWS) {
    await revColl.updateOne({ id: rev.id }, { $set: rev }, { upsert: true });
  }

  // 8. Upsert Student Results
  const resColl = db.collection('studentresults');
  for (const res of INITIAL_RESULTS) {
    await resColl.updateOne({ id: res.id }, { $set: res }, { upsert: true });
  }

  // 9. Upsert Notices
  const noticesColl = db.collection('notices');
  for (const notice of INITIAL_NOTICES) {
    await noticesColl.updateOne({ id: notice.id }, { $set: notice }, { upsert: true });
  }

  // 10. Upsert Activities
  const activitiesColl = db.collection('activityposts');
  for (const act of INITIAL_ACTIVITIES) {
    await activitiesColl.updateOne({ id: act.id }, { $set: act }, { upsert: true });
  }

  // 11. Upsert Enquiries
  const enqColl = db.collection('admissionenquiries');
  for (const enq of INITIAL_ENQUIRIES) {
    await enqColl.updateOne({ id: enq.id }, { $set: enq }, { upsert: true });
  }

  // Summary counts
  console.log('📊 Complete MongoDB Preschool Data Summary:');
  for (const collName of ALL_COLLECTIONS) {
    const count = await db.collection(collName).countDocuments();
    console.log(`  • ${collName.padEnd(22)}: ${count} document(s)`);
  }

  console.log('\n🎉 Preschool database successfully enriched with complete sample data!');
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('❌ Error seeding preschool MongoDB database:', err);
  process.exit(1);
});
