import { User, Student, SchoolSettings, AttendanceRecord, TeacherReview, ActivityPost, StudentResult, FeeInvoice, Notice, AdmissionEnquiry, AuditLogEntry } from '@/types';
import { hashPasswordSync } from '@/lib/security';

export const INITIAL_SETTINGS: SchoolSettings = {
  schoolName: "London Kids Preschool Avalurpet",
  tagline: "Nurturing Little Minds with Love, Play & Wonder",
  address: "Main Road, Near Bus Stand, Avalurpet",
  cityState: "Avalurpet, Tamil Nadu – 606 702",
  phone: "+91 90436 33545",
  email: "londonkidsavalurpet@gmail.com",
  registrationNo: "PRE-2024-TN-8842",
  academicYear: "2026-2027",
  timings: "8:30 AM - 1:30 PM (Extended care till 5:00 PM)",
  fees: {
    PLAY_SCHOOL: 18000,
    NURSERY: 22000,
    LKG: 26000,
    UKG: 30000
  }
};

export const DEMO_USERS: User[] = [
  // Director
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
    passwordHash: hashPasswordSync('90436 33545'),
    emailVerified: true,
    mustChangePassword: false
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
    passwordHash: hashPasswordSync('teacher123'),
    emailVerified: true,
    mustChangePassword: false
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
    passwordHash: hashPasswordSync('teacher123'),
    emailVerified: true,
    mustChangePassword: false
  },
  // Parent 1
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
    passwordHash: hashPasswordSync('parent123'),
    emailVerified: true,
    mustChangePassword: false
  },
  // Parent 2
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
    passwordHash: hashPasswordSync('parent123'),
    emailVerified: true,
    mustChangePassword: false
  },
  // Parent 3
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
    passwordHash: hashPasswordSync('parent123'),
    emailVerified: true,
    mustChangePassword: false
  }
];

export const DEMO_STUDENTS: Student[] = [
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
    updatedAt: '2026-06-01'
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
    updatedAt: '2026-06-01'
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
    updatedAt: '2026-06-01'
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
    updatedAt: '2026-06-01'
  }
];

export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-ps-01',
    studentId: 'student-lk-ps-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Cheerfully participated in sensory play',
    markedBy: 'Mrs. Kavitha Raman'
  },
  {
    id: 'att-nur-01',
    studentId: 'student-lk-nur-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Active in story time session',
    markedBy: 'Mrs. Kavitha Raman'
  },
  {
    id: 'att-lkg-01',
    studentId: 'student-lk-lkg-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Excellent focus during phonics tracing',
    markedBy: 'Ms. Priya Sundaram'
  },
  {
    id: 'att-ukg-01',
    studentId: 'student-lk-ukg-01',
    date: '2026-09-22',
    status: 'PRESENT',
    remarks: 'Led morning circle greeting',
    markedBy: 'Ms. Priya Sundaram'
  }
];

export const DEMO_REVIEWS: TeacherReview[] = [
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
    recommendations: 'Encourage rhyming songs and bedtime book reading at home.'
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
    recommendations: 'Continue practicing simple number sequencing up to 50.'
  }
];

export const DEMO_ACTIVITIES: ActivityPost[] = [
  {
    id: 'act-arts-crafts-1',
    level: 'PLAY_SCHOOL',
    title: 'Color Splash & Sensory Finger Painting',
    description: 'Our play group and nursery kids had a wonderful sensory experience exploring vibrant colors and developing fine motor skills!',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop&q=80',
    category: 'Arts & Crafts',
    createdBy: 'School Director'
  },
  {
    id: 'act-story-phonics-1',
    level: 'LKG',
    title: 'Story Time & Phonics Adventure',
    description: 'Engaging phonics exploration and puppet storytelling session fostering early language skills and creative imagination.',
    date: '2026-09-22',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    category: 'Story & Phonics',
    createdBy: 'School Director'
  }
];

export const DEMO_RESULTS: StudentResult[] = [
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
      { skillName: 'Social Interaction & Sharing', grade: 'Excellent', score: 96 }
    ],
    attendancePercentage: 98,
    teacherRemark: 'Outstanding performance and cheerful attitude throughout the term!',
    promotedToNextGrade: true
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
      { skillName: 'Physical Play & Sportsmanship', grade: 'Excellent', score: 95 }
    ],
    attendancePercentage: 97,
    teacherRemark: 'Confident speaker and enthusiastic learner in all classroom activities.',
    promotedToNextGrade: true
  }
];

export const DEMO_INVOICES: FeeInvoice[] = [
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
        description: 'Annual tuition fee paid in full'
      }
    ]
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
        description: 'First installment tuition fee'
      }
    ]
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
        description: 'Full annual preschool fee paid via GPay'
      }
    ]
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
        description: 'First term fee cash counter payment'
      }
    ]
  }
];

export const DEMO_NOTICES: Notice[] = [
  {
    id: 'notice-admissions-2026',
    title: 'Admissions Open for Academic Year 2026-2027',
    content: 'Admissions are now open for Play Group, Nursery, LKG, and UKG for the upcoming academic year 2026-2027. Parents are warmly invited to visit our preschool campus or register online.',
    targetLevel: 'ALL',
    date: '2026-09-20',
    authorName: 'School Director',
    priority: 'HIGH',
    category: 'Circular'
  },
  {
    id: 'notice-welcome-session',
    title: 'Welcome to London Kids Preschool Avalurpet',
    content: 'We welcome all parents and children to our vibrant learning community! Our curriculum combines UK-standard early childhood development with playful sensory exploration.',
    targetLevel: 'ALL',
    date: '2026-09-21',
    authorName: 'School Director',
    priority: 'NORMAL',
    category: 'Event'
  }
];

export const DEMO_ENQUIRIES: AdmissionEnquiry[] = [
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
    status: 'CONTACTED'
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
    status: 'NEW'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];
