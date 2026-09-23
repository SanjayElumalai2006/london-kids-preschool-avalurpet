'use client';

import { 
  User, Student, AttendanceRecord, TeacherReview, 
  ActivityPost, StudentResult, FeeInvoice, Notice, 
  AdmissionEnquiry, SchoolSettings, 
  AuditLogEntry 
} from '@/types';
import { hashPasswordSync } from '@/lib/security';
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
  INITIAL_AUDIT_LOGS,
} from '@/lib/initialData';

export {
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
  INITIAL_AUDIT_LOGS,
};

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

let isSyncing = false;
let hasInitialSynced = false;
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingSyncData: Partial<AppStoreData> = {};

/**
 * Transparent background synchronization with MongoDB via /api/db/sync
 */
export async function syncWithDatabase(): Promise<void> {
  if (typeof window === 'undefined' || isSyncing) return;
  isSyncing = true;

  try {
    const res = await fetch('/api/db/sync');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json && json.success && json.data) {
      const dbData = json.data;
      const current = getStore();

      // Merge MongoDB data with local storage
      const merged: AppStoreData = {
        ...current,
        settings: dbData.settings || current.settings,
        users: dbData.users && dbData.users.length > 0 ? dbData.users : current.users,
        students: dbData.students || current.students,
        attendance: dbData.attendance || current.attendance,
        reviews: dbData.reviews || current.reviews,
        activities: dbData.activities || current.activities,
        results: dbData.results || current.results,
        invoices: dbData.invoices || current.invoices,
        notices: dbData.notices || current.notices,
        enquiries: dbData.enquiries || current.enquiries,
        auditLogs: dbData.auditLogs || current.auditLogs,
        currentUser: current.currentUser, // Keep local user session intact
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event('preschool_store_updated'));
    }
  } catch (err) {
    console.warn('Background database sync deferred (offline or starting up):', err);
  } finally {
    isSyncing = false;
    hasInitialSynced = true;
  }
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
      currentUser: null,
    };
  }

  // Trigger background sync if not yet run
  if (!hasInitialSynced && !isSyncing) {
    setTimeout(() => {
      syncWithDatabase();
    }, 100);
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
        currentUser: null,
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

    if (parsed.students && Array.isArray(parsed.students) && parsed.students.length > 0) {
      parsed.students = parsed.students.filter((s: any) => !FAKE_STUDENT_PREFIXES.some(prefix => s.id?.startsWith(prefix)));
      if (parsed.students.length === 0) parsed.students = DEMO_STUDENTS;
    } else {
      parsed.students = DEMO_STUDENTS;
    }

    if (parsed.attendance && Array.isArray(parsed.attendance) && parsed.attendance.length > 0) {
      parsed.attendance = parsed.attendance.filter((a: any) => !FAKE_STUDENT_PREFIXES.some(prefix => a.studentId?.startsWith(prefix)));
      if (parsed.attendance.length === 0) parsed.attendance = DEMO_ATTENDANCE;
    } else {
      parsed.attendance = DEMO_ATTENDANCE;
    }

    if (parsed.reviews && Array.isArray(parsed.reviews) && parsed.reviews.length > 0) {
      parsed.reviews = parsed.reviews.filter((r: any) => !FAKE_STUDENT_PREFIXES.some(prefix => r.studentId?.startsWith(prefix)));
      if (parsed.reviews.length === 0) parsed.reviews = DEMO_REVIEWS;
    } else {
      parsed.reviews = DEMO_REVIEWS;
    }

    if (parsed.results && Array.isArray(parsed.results) && parsed.results.length > 0) {
      parsed.results = parsed.results.filter((r: any) => !FAKE_STUDENT_PREFIXES.some(prefix => r.studentId?.startsWith(prefix)));
      if (parsed.results.length === 0) parsed.results = DEMO_RESULTS;
    } else {
      parsed.results = DEMO_RESULTS;
    }

    if (parsed.invoices && Array.isArray(parsed.invoices) && parsed.invoices.length > 0) {
      parsed.invoices = parsed.invoices.filter((i: any) => !FAKE_STUDENT_PREFIXES.some(prefix => i.studentId?.startsWith(prefix)));
      if (parsed.invoices.length === 0) parsed.invoices = DEMO_INVOICES;
    } else {
      parsed.invoices = DEMO_INVOICES;
    }

    if (!parsed.notices || !Array.isArray(parsed.notices) || parsed.notices.length === 0) {
      parsed.notices = DEMO_NOTICES;
    }

    if (!parsed.activities || !Array.isArray(parsed.activities) || parsed.activities.length === 0) {
      parsed.activities = DEMO_ACTIVITIES;
    }

    if (!parsed.enquiries || !Array.isArray(parsed.enquiries) || parsed.enquiries.length === 0) {
      parsed.enquiries = DEMO_ENQUIRIES;
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
    
    // Guarantee no raw password is ever serialized
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

    // Queue asynchronous background sync to MongoDB
    pendingSyncData = { ...pendingSyncData, ...data };
    delete (pendingSyncData as any).currentUser; // Do not persist active browser session to global DB sync

    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
      const payload = { ...pendingSyncData };
      pendingSyncData = {};
      if (Object.keys(payload).length === 0) return;

      try {
        await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Background database write deferred (offline or starting up):', err);
      }
    }, 300);
  } catch (e) {
    console.error('Error saving store to localStorage', e);
  }
}

export function resetStoreToDefaults() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('preschool_store_updated'));
  syncWithDatabase();
}

// Automatically initiate sync on client mount
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncWithDatabase();
  }, 100);
}
