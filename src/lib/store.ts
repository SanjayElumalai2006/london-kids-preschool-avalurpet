'use client';

import { 
  User, Student, AttendanceRecord, TeacherReview, 
  ActivityPost, StudentResult, FeeInvoice, Notice, 
  AdmissionEnquiry, SchoolSettings, 
  AuditLogEntry 
} from '@/types';
import { hashPasswordSync } from '@/lib/security';

// Default initial settings
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

// Official Initial Accounts (No fake profiles)
export const DEMO_USERS: User[] = [
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
    mustChangePassword: true
  }
];

// Clean empty arrays for a completely fresh deployment
export const DEMO_STUDENTS: Student[] = [];
export const DEMO_ATTENDANCE: AttendanceRecord[] = [];
export const DEMO_REVIEWS: TeacherReview[] = [];
export const DEMO_ACTIVITIES: ActivityPost[] = [];
export const DEMO_RESULTS: StudentResult[] = [];
export const DEMO_INVOICES: FeeInvoice[] = [];
export const DEMO_NOTICES: Notice[] = [];
export const DEMO_ENQUIRIES: AdmissionEnquiry[] = [];
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Storage Helper Functions with LocalStorage Sync
const STORAGE_KEY = 'londonkids_preschool_db_v1';

export interface AppStoreData {
  settings: SchoolSettings;
  users: User[];
  students: Student[];
  attendance: AttendanceRecord[];
  reviews: TeacherReview[];
  activities: ActivityPost[];
  results: StudentResult[];
  invoices: FeeInvoice[];
  notices: Notice[];
  enquiries: AdmissionEnquiry[];
  auditLogs: AuditLogEntry[];
  currentUser: User | null;
}

export function getStore(): AppStoreData {
  if (typeof window === 'undefined') {
    return {
      settings: INITIAL_SETTINGS,
      users: DEMO_USERS,
      students: DEMO_STUDENTS,
      attendance: DEMO_ATTENDANCE,
      reviews: DEMO_REVIEWS,
      activities: DEMO_ACTIVITIES,
      results: DEMO_RESULTS,
      invoices: DEMO_INVOICES,
      notices: DEMO_NOTICES,
      enquiries: DEMO_ENQUIRIES,
      auditLogs: INITIAL_AUDIT_LOGS,
      currentUser: null
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial: AppStoreData = {
        settings: INITIAL_SETTINGS,
        users: DEMO_USERS,
        students: DEMO_STUDENTS,
        attendance: DEMO_ATTENDANCE,
        reviews: DEMO_REVIEWS,
        activities: DEMO_ACTIVITIES,
        results: DEMO_RESULTS,
        invoices: DEMO_INVOICES,
        notices: DEMO_NOTICES,
        enquiries: DEMO_ENQUIRIES,
        auditLogs: INITIAL_AUDIT_LOGS,
        currentUser: null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    
    // Ensure school phone in settings is updated to +91 90436 33545
    if (parsed.settings) {
      parsed.settings.phone = "+91 90436 33545";
    } else {
      parsed.settings = INITIAL_SETTINGS;
    }

    // Purge any fake profiles that might have been saved in localStorage
    const FAKE_USER_EMAILS = new Set([
      'teacher.kavitha@gmail.com',
      'staff.support@gmail.com',
      'parent.priya@gmail.com',
      'aarav.student@gmail.com',
      'parent@londonkids.edu',
      'teacher.lkg@londonkids.edu',
      'admin@londonkids.edu',
      'owner@londonkids.edu',
      'farhan.khan@example.com',
      'maya.nair@example.com',
      'shilpa.verma@example.com',
      'tina.joshi@example.com',
      'meera.sen@example.com',
      'david.m@example.com',
      'sneha.chawla@example.com'
    ]);

    const FAKE_STUDENT_PREFIXES = ['stud-aarav', 'stud-samaira', 'stud-advait', 'stud-ananya', 'stud-kabir', 'stud-riya'];

    if (parsed.users && Array.isArray(parsed.users)) {
      parsed.users = parsed.users.filter((u: any) => {
        const pEmail = (u.personalEmail || '').trim().toLowerCase();
        const email = (u.email || '').trim().toLowerCase();
        return !FAKE_USER_EMAILS.has(pEmail) && !FAKE_USER_EMAILS.has(email);
      });

      for (const du of DEMO_USERS) {
        const existingIdx = parsed.users.findIndex((u: User) => 
          u.id === du.id ||
          (u.email && du.email && u.email.trim().toLowerCase() === du.email.trim().toLowerCase()) ||
          (u.personalEmail && du.personalEmail && u.personalEmail.trim().toLowerCase() === du.personalEmail.trim().toLowerCase())
        );
        if (existingIdx === -1) {
          parsed.users.push(du);
        } else {
          if (!parsed.users[existingIdx].passwordHash) parsed.users[existingIdx].passwordHash = du.passwordHash;
          if (!parsed.users[existingIdx].status) parsed.users[existingIdx].status = 'ACTIVE';
          if (!parsed.users[existingIdx].createdAt && du.createdAt) parsed.users[existingIdx].createdAt = du.createdAt;
          if (!parsed.users[existingIdx].personalEmail) parsed.users[existingIdx].personalEmail = du.personalEmail;
          if (!parsed.users[existingIdx].email) parsed.users[existingIdx].email = du.email;
          if (!parsed.users[existingIdx].role) parsed.users[existingIdx].role = du.role;
          if (!parsed.users[existingIdx].employeeId && du.employeeId) parsed.users[existingIdx].employeeId = du.employeeId;
          if (!parsed.users[existingIdx].dateOfJoining && du.dateOfJoining) parsed.users[existingIdx].dateOfJoining = du.dateOfJoining;
          if (!parsed.users[existingIdx].address && du.address) parsed.users[existingIdx].address = du.address;
          if (!parsed.users[existingIdx].photo && (du.photo || du.avatar)) parsed.users[existingIdx].photo = du.photo || du.avatar;
          parsed.users[existingIdx].phone = du.phone;
        }
      }

      // Sanitize all users: eliminate raw password, guarantee passwordHash, emailVerified, studentIds
      parsed.users = parsed.users.map((u: any) => {
        const { password: _p, ...cleaned } = u;
        let passwordHash = cleaned.passwordHash;
        if (!passwordHash && _p) {
          passwordHash = hashPasswordSync(_p);
        }
        if (!passwordHash) {
          passwordHash = hashPasswordSync('LK2026!');
        }
        const studentIds: string[] = Array.isArray(cleaned.studentIds)
          ? cleaned.studentIds
          : (cleaned.studentId ? [cleaned.studentId] : []);
        return {
          ...cleaned,
          passwordHash,
          emailVerified: cleaned.emailVerified !== undefined ? cleaned.emailVerified : true,
          studentIds,
          studentId: cleaned.studentId || (studentIds.length > 0 ? studentIds[0] : undefined),
          status: cleaned.status || 'ACTIVE'
        };
      });
    } else {
      parsed.users = DEMO_USERS;
    }

    if (parsed.students && Array.isArray(parsed.students)) {
      parsed.students = parsed.students.filter((s: any) => !FAKE_STUDENT_PREFIXES.some(prefix => s.id?.startsWith(prefix)));
    } else {
      parsed.students = [];
    }

    if (parsed.attendance && Array.isArray(parsed.attendance)) {
      parsed.attendance = parsed.attendance.filter((a: any) => !FAKE_STUDENT_PREFIXES.some(prefix => a.studentId?.startsWith(prefix)));
    } else {
      parsed.attendance = [];
    }

    if (parsed.reviews && Array.isArray(parsed.reviews)) {
      parsed.reviews = parsed.reviews.filter((r: any) => !FAKE_STUDENT_PREFIXES.some(prefix => r.studentId?.startsWith(prefix)));
    } else {
      parsed.reviews = [];
    }

    if (parsed.results && Array.isArray(parsed.results)) {
      parsed.results = parsed.results.filter((r: any) => !FAKE_STUDENT_PREFIXES.some(prefix => r.studentId?.startsWith(prefix)));
    } else {
      parsed.results = [];
    }

    if (parsed.invoices && Array.isArray(parsed.invoices)) {
      parsed.invoices = parsed.invoices.filter((i: any) => !FAKE_STUDENT_PREFIXES.some(prefix => i.studentId?.startsWith(prefix)));
    } else {
      parsed.invoices = [];
    }

    if (parsed.currentUser) {
      const cEmail = (parsed.currentUser.personalEmail || parsed.currentUser.email || '').toLowerCase();
      if (FAKE_USER_EMAILS.has(cEmail)) {
        parsed.currentUser = null;
      } else {
        const { password: _p, ...currClean } = parsed.currentUser as any;
        if (!currClean.passwordHash && _p) {
          currClean.passwordHash = hashPasswordSync(_p);
        }
        if (currClean.emailVerified === undefined) currClean.emailVerified = true;
        if (!currClean.studentIds && currClean.studentId) {
          currClean.studentIds = [currClean.studentId];
        }
        parsed.currentUser = currClean;
      }
    } else {
      parsed.currentUser = null;
    }

    if (!parsed.auditLogs || !Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs = [];
    }

    // Persist cleaned data back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

    return parsed;
  } catch (e) {
    console.error('Error loading store from localStorage', e);
    return {
      settings: INITIAL_SETTINGS,
      users: DEMO_USERS,
      students: DEMO_STUDENTS,
      attendance: DEMO_ATTENDANCE,
      reviews: DEMO_REVIEWS,
      activities: DEMO_ACTIVITIES,
      results: DEMO_RESULTS,
      invoices: DEMO_INVOICES,
      notices: DEMO_NOTICES,
      enquiries: DEMO_ENQUIRIES,
      auditLogs: INITIAL_AUDIT_LOGS,
      currentUser: null
    };
  }
}

export function saveStore(data: Partial<AppStoreData>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getStore();
    const updated = { ...current, ...data };
    // Guarantee no raw password is ever serialized to localStorage
    if (updated.currentUser) {
      const { password: _p, ...cleanCurrentUser } = updated.currentUser as any;
      updated.currentUser = cleanCurrentUser;
    }
    if (updated.users && Array.isArray(updated.users)) {
      updated.users = updated.users.map((u: any) => {
        const { password: _p, ...cleanUser } = u;
        return cleanUser;
      });
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch custom event for cross-component reactivity
    window.dispatchEvent(new Event('preschool_store_updated'));
  } catch (e) {
    console.error('Error saving store to localStorage', e);
  }
}

export function resetStoreToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('preschool_store_updated'));
}
