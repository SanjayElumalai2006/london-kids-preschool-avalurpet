export type UserRole = 'OWNER' | 'ADMIN' | 'TEACHER' | 'STAFF' | 'PARENT' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'REMOVED';

export type SchoolLevel = 'PLAY_SCHOOL' | 'NURSERY' | 'LKG' | 'UKG';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type FeeStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type EnquiryStatus = 'NEW' | 'CONTACTED' | 'ADMITTED';

export interface User {
  id: string;
  name: string;
  email: string; // Official school email address
  personalEmail?: string; // Personal email address
  role: UserRole;
  phone: string;
  photo?: string;
  avatar?: string;
  address?: string;
  dateOfJoining?: string;
  employeeId?: string; // For Owner, Admin, Teacher, Staff
  assignedClass?: SchoolLevel;
  assignedSection?: string;
  studentId?: string; // Backward compatibility for single linked child
  studentIds?: string[]; // Multiple linked children for Parent
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  passwordHash?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationExpiresAt?: string;
  mustChangePassword?: boolean;
  removedAt?: string;
  removedBy?: string;
}

export type AuditAction = 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'PASSWORD_RESET' | 'ROLE_CHANGE' | 'REMOVE' | 'RESTORE';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: UserRole;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  level: SchoolLevel;
  section: string;
  rollNo: string;
  bloodGroup: string;
  photo: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  teacherId: string;
  teacherName: string;
  emergencyContact: string;
  medicalNotes: string;
  admissionDate: string;
  status?: UserStatus;
  removedAt?: string;
  removedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
}

export interface TeacherReview {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  date: string;
  socialSkills: number; // 1 to 5
  fineMotor: number; // 1 to 5
  languageCommunication: number; // 1 to 5
  emotionalRegulation: number; // 1 to 5
  overallRating: number; // 1 to 5
  comments: string;
  recommendations?: string;
}

export type GalleryCategory = 'ALL' | 'EVENTS' | 'CLASSROOM' | 'PLAY' | 'ARTS' | 'CAMPUS';

export interface EventPhoto {
  id: string;
  title: string;
  caption: string;
  date: string;
  category: 'EVENTS' | 'CLASSROOM' | 'PLAY' | 'ARTS' | 'CAMPUS';
  imageUrl: string;
  uploadedBy: string;
  showOnPublicWebsite: boolean;
  targetLevel?: SchoolLevel | 'ALL';
  createdAt?: string;
}

export interface ActivityPost {
  id: string;
  level: SchoolLevel | 'ALL';
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: 'Arts & Crafts' | 'Sensory & Play' | 'Music & Dance' | 'Story & Phonics' | 'Outdoor Fun' | 'Celebration';
  createdBy: string;
}

export interface StudentResult {
  id: string;
  studentId: string;
  term: 'Term 1' | 'Term 2' | 'Annual';
  academicYear: string;
  date: string;
  skills: {
    skillName: string;
    grade: 'Excellent' | 'Very Good' | 'Good' | 'Needs Practice';
    score: number; // 1-100
  }[];
  attendancePercentage: number;
  teacherRemark: string;
  promotedToNextGrade?: boolean;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  date: string;
  amount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'CASH';
  transactionId: string;
  description: string;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  invoiceNo: string;
  totalAnnualFee: number;
  paidAmount: number;
  dueAmount: number;
  dueDate: string;
  status: FeeStatus;
  term: string;
  receipts: FeeReceipt[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  targetLevel: SchoolLevel | 'ALL';
  date: string;
  authorName: string;
  priority: 'NORMAL' | 'HIGH';
  category: 'Circular' | 'Event' | 'Holiday' | 'Homework';
}

export interface AdmissionEnquiry {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  targetLevel: SchoolLevel;
  message: string;
  submittedAt: string;
  status: EnquiryStatus;
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  registrationNo: string;
  academicYear: string;
  timings: string;
  fees: Record<SchoolLevel, number>;
}
