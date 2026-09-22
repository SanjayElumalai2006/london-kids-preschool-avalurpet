'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, ShieldCheck, CheckCircle2, 
  AlertTriangle, Key, Edit, Eye, X, Phone, Mail, 
  GraduationCap, UserPlus, UserCheck, History, Clock, Lock, Calendar,
  Trash2, RotateCcw
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { User, UserRole, SchoolLevel, AuditLogEntry, AuditAction } from '@/types';
import { hashPasswordSync } from '@/lib/security';
import PhotoUploadDropzone from '@/components/PhotoUploadDropzone';

interface UserManagementViewProps {
  callerRole: 'OWNER' | 'ADMIN';
  defaultTab?: 'DIRECTORY' | 'ENROLL' | 'AUDIT';
}

const SCHOOL_LEVELS: { id: SchoolLevel; name: string }[] = [
  { id: 'PLAY_SCHOOL', name: 'Play School (1.5 – 2.5 yrs)' },
  { id: 'NURSERY', name: 'Nursery (2.5 – 3.5 yrs)' },
  { id: 'LKG', name: 'LKG (3.5 – 4.5 yrs)' },
  { id: 'UKG', name: 'UKG (4.5 – 5.5 yrs)' }
];

const SECTION_OPTIONS = [
  'Little Cubs',
  'Butterflies',
  'Teddy Bears',
  'Sunshine Stars',
  'Kinder Blossoms',
  'Junior Explorers',
  'School Van Route 1',
  'Extended Daycare',
  'Campus Operations'
];


function generateRandomPassword(): string {
  return 'LK' + Math.floor(1000 + Math.random() * 9000) + '!';
}

function generateRandomEmployeeId(): string {
  return 'EMP-LK-' + Math.floor(100 + Math.random() * 900);
}

function generateAuditId(): string {
  return `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function generateUserId(): string {
  return `user-${Date.now()}`;
}

const DEFAULT_ENROLL_FORM = {
  name: '',
  role: 'TEACHER' as UserRole,
  personalEmail: '',
  email: '',
  phone: '+91 90436 33545',
  address: 'Avalurpet, Tamil Nadu – 606 702',
  dateOfJoining: '2026-06-01',
  employeeId: 'EMP-LK-301',
  assignedClass: 'LKG' as SchoolLevel,
  assignedSection: 'Butterflies',
  studentId: '',
  studentIds: [] as string[],
  password: 'LK2026!',
  status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  mustChangePassword: false
};

export default function UserManagementView({ callerRole, defaultTab = 'DIRECTORY' }: UserManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ENROLL' | 'AUDIT'>(defaultTab);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE_AND_INACTIVE');
  const [auditSearch, setAuditSearch] = useState('');

  // Modals state
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);
  const [confirmRemoveUser, setConfirmRemoveUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalError, setModalError] = useState<string>('');

  // Enrollment / Add Form State
  const [enrollForm, setEnrollForm] = useState(DEFAULT_ENROLL_FORM);

  const loadData = () => {
    const store = getStore();
    setUsers(store.users || []);
    const activeStudents = (store.students || []).filter((s: any) => s.status === 'ACTIVE' || !s.status);
    setStudents(activeStudents);
    setAuditLogs(store.auditLogs || []);

    if (activeStudents.length && (!enrollForm.studentIds || enrollForm.studentIds.length === 0) && !enrollForm.studentId) {
      setEnrollForm(f => ({ 
        ...f, 
        studentId: f.studentId || activeStudents[0].id,
        studentIds: f.studentIds?.length ? f.studentIds : [activeStudents[0].id]
      }));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Helper to record an audit log entry
  const recordAudit = (action: AuditAction, targetUser: { id: string; name: string; role: UserRole }, details: string) => {
    const store = getStore();
    const currentAdmin = store.currentUser?.name 
      ? `${store.currentUser.name} (${store.currentUser.role})` 
      : 'Mr. Sanjay Elumalai (Admin)';
    const adminId = store.currentUser?.id || 'user-admin-sanjay';

    const newLog: AuditLogEntry = {
      id: generateAuditId(),
      action,
      targetUserId: targetUser.id,
      targetUserName: targetUser.name,
      targetUserRole: targetUser.role,
      performedBy: adminId,
      performedByName: currentAdmin,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details
    };

    const updatedLogs = [newLog, ...(store.auditLogs || [])];
    saveStore({ auditLogs: updatedLogs });
    setAuditLogs(updatedLogs);
  };

  // Check duplicate emails across all accounts (both official and personal)
  // Unique Email Validation (Personal Email only)
  const validateUniqueEmails = (personalEmail: string, excludeUserId?: string) => {
    const cleanPersonal = personalEmail.trim().toLowerCase();
    if (!cleanPersonal) {
      return 'Personal email address is required.';
    }

    for (const u of users) {
      if (excludeUserId && u.id === excludeUserId) continue;

      const userOfficial = (u.email || '').trim().toLowerCase();
      const userPersonal = (u.personalEmail || '').trim().toLowerCase();

      if (userPersonal === cleanPersonal || userOfficial === cleanPersonal) {
        return `Personal email "${personalEmail}" is already registered to "${u.name}". Email must be unique across accounts.`;
      }
    }
    return null;
  };

  const validateUniqueEmployeeId = (employeeId?: string, excludeUserId?: string) => {
    if (!employeeId || !employeeId.trim()) return null;
    const cleanEmpId = employeeId.trim().toLowerCase();
    for (const u of users) {
      if (excludeUserId && u.id === excludeUserId) continue;
      if (u.employeeId && u.employeeId.trim().toLowerCase() === cleanEmpId) {
        return `Employee ID "${employeeId}" is already assigned to "${u.name}".`;
      }
    }
    return null;
  };

  const validateUniquePhone = (phone: string) => {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return 'Please enter a valid 10-digit mobile phone number.';
    }
    return null;
  };

  // 1. Handle Enroll New User
  const handleEnrollUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (callerRole === 'ADMIN' && enrollForm.role === 'OWNER') {
      showFeedback('error', 'Administrators are not authorized to create Owner accounts.');
      return;
    }

    if (!enrollForm.name.trim()) {
      showFeedback('error', 'Full name is required.');
      return;
    }

    const personalEmail = (enrollForm.personalEmail || enrollForm.email).trim().toLowerCase();
    if (!personalEmail) {
      showFeedback('error', 'Please provide a personal email address for account registration.');
      return;
    }

    const emailError = validateUniqueEmails(personalEmail);
    if (emailError) {
      showFeedback('error', emailError);
      return;
    }

    if (['OWNER', 'ADMIN', 'TEACHER', 'STAFF'].includes(enrollForm.role)) {
      const empIdError = validateUniqueEmployeeId(enrollForm.employeeId);
      if (empIdError) {
        showFeedback('error', empIdError);
        return;
      }
    }

    const phoneError = validateUniquePhone(enrollForm.phone);
    if (phoneError) {
      showFeedback('error', phoneError);
      return;
    }

    const rawPassword = enrollForm.password.trim() || 'LK2026!';
    const hashedPassword = hashPasswordSync(rawPassword);

    let selectedStudentIds: string[] = [];
    if (enrollForm.role === 'PARENT') {
      if (enrollForm.studentIds && enrollForm.studentIds.length > 0) {
        selectedStudentIds = enrollForm.studentIds;
      } else if (enrollForm.studentId) {
        selectedStudentIds = [enrollForm.studentId];
      } else if (students.length > 0) {
        selectedStudentIds = [students[0].id];
      }
    }

    const newUser: User = {
      id: generateUserId(),
      name: enrollForm.name.trim(),
      email: personalEmail,
      personalEmail: personalEmail,
      role: enrollForm.role,
      phone: enrollForm.phone.trim(),
      address: enrollForm.address.trim(),
      dateOfJoining: enrollForm.dateOfJoining,
      employeeId: ['OWNER', 'ADMIN', 'TEACHER', 'STAFF'].includes(enrollForm.role) ? enrollForm.employeeId.trim() : undefined,
      assignedClass: ['TEACHER', 'STAFF', 'STUDENT'].includes(enrollForm.role) ? enrollForm.assignedClass : undefined,
      assignedSection: ['TEACHER', 'STAFF', 'STUDENT'].includes(enrollForm.role) ? enrollForm.assignedSection : undefined,
      studentId: enrollForm.role === 'PARENT' ? selectedStudentIds[0] : (enrollForm.role === 'STUDENT' ? (students[0]?.id || '') : undefined),
      studentIds: enrollForm.role === 'PARENT' ? selectedStudentIds : undefined,
      photo: enrollForm.photo,
      avatar: enrollForm.photo,
      status: enrollForm.status,
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      passwordHash: hashedPassword,
      mustChangePassword: Boolean(enrollForm.mustChangePassword)
    };

    const updated = [newUser, ...users];
    saveStore({ users: updated });
    setUsers(updated);

    // Record in audit log (NEVER expose plaintext password)
    recordAudit(
      'CREATE',
      newUser,
      `Enrolled new ${newUser.role} account with personal email "${newUser.personalEmail}". Security credentials initialized.`
    );

    showFeedback('success', `User "${newUser.name}" successfully enrolled as ${newUser.role}! Account is active and ready for login.`);
    setActiveTab('DIRECTORY');

    // Reset Form
    setEnrollForm({
      ...DEFAULT_ENROLL_FORM,
      employeeId: generateRandomEmployeeId(),
      password: generateRandomPassword()
    });
  };

  // 2. Handle Save Edit User
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!editingUser) return;

    const previousUser = users.find(u => u.id === editingUser.id);

    const personalEmail = (editingUser.personalEmail || editingUser.email || '').trim().toLowerCase();
    if (!personalEmail) {
      setModalError('Personal email address is required.');
      return;
    }

    const emailError = validateUniqueEmails(personalEmail, editingUser.id);
    if (emailError) {
      setModalError(emailError);
      return;
    }

    if (['OWNER', 'ADMIN', 'TEACHER', 'STAFF'].includes(editingUser.role) && editingUser.employeeId) {
      const empIdError = validateUniqueEmployeeId(editingUser.employeeId, editingUser.id);
      if (empIdError) {
        setModalError(empIdError);
        return;
      }
    }

    const phoneError = validateUniquePhone(editingUser.phone);
    if (phoneError) {
      setModalError(phoneError);
      return;
    }

    const roleChanged = previousUser && previousUser.role !== editingUser.role;

    const studentIds = editingUser.role === 'PARENT'
      ? (editingUser.studentIds && editingUser.studentIds.length > 0 
          ? editingUser.studentIds 
          : (editingUser.studentId ? [editingUser.studentId] : []))
      : undefined;

    const updatedUser: User = {
      ...editingUser,
      email: personalEmail,
      personalEmail: personalEmail,
      studentIds,
      studentId: studentIds && studentIds.length > 0 ? studentIds[0] : undefined,
      updatedAt: new Date().toISOString()
    };

    const updated = users.map(u => u.id === editingUser.id ? updatedUser : u);
    
    const store = getStore();
    const updatedStorePayload: any = { users: updated };
    if (store.currentUser && store.currentUser.id === editingUser.id) {
      updatedStorePayload.currentUser = { ...store.currentUser, ...updatedUser };
    }
    saveStore(updatedStorePayload);
    setUsers(updated);

    // Record in audit log
    if (roleChanged) {
      recordAudit(
        'ROLE_CHANGE',
        updatedUser,
        `Role changed from ${previousUser?.role} to ${updatedUser.role}. Updated profile details and assignments.`
      );
    } else {
      recordAudit(
        'UPDATE',
        updatedUser,
        `Updated account profile details, contact information, and role assignments.`
      );
    }

    showFeedback('success', `User "${updatedUser.name}" details updated and saved successfully!`);
    setEditingUser(null);
    setModalError('');
  };

  // 3. Handle Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdUser) return;

    if (callerRole === 'ADMIN' && resetPwdUser.role === 'OWNER') {
      showFeedback('error', 'Administrators are not permitted to reset Owner passwords.');
      setResetPwdUser(null);
      return;
    }

    if (!tempPassword || tempPassword.trim().length < 5) {
      showFeedback('error', 'Temporary password must be at least 5 characters.');
      return;
    }

    const hashedTemp = hashPasswordSync(tempPassword.trim());

    const updated = users.map(u => {
      if (u.id === resetPwdUser.id) {
        const rest = { ...u } as any;
        delete rest.password;
        return {
          ...rest,
          passwordHash: hashedTemp,
          mustChangePassword: true, // Mandate change on next login
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveStore({ users: updated });
    setUsers(updated);

    recordAudit(
      'PASSWORD_RESET',
      resetPwdUser,
      `Reset password credential for user account. Mandatory password update flag enabled.`
    );

    showFeedback('success', `Password for "${resetPwdUser.name}" has been reset securely. They can set a new password on next login.`);
    setResetPwdUser(null);
    setTempPassword('');
  };

  // 4. Handle Activate / Deactivate Toggle (Never delete)
  const handleToggleStatus = (user: User) => {
    if (callerRole === 'ADMIN' && user.role === 'OWNER') {
      showFeedback('error', 'Administrators are not permitted to modify or deactivate Owner accounts.');
      return;
    }

    const newStatus: 'ACTIVE' | 'INACTIVE' = user.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    const updated = users.map(u => u.id === user.id ? { ...u, status: newStatus } : u);
    saveStore({ users: updated });
    setUsers(updated);

    recordAudit(
      'STATUS_CHANGE',
      user,
      `Changed account status from ${user.status || 'ACTIVE'} to ${newStatus}.`
    );

    showFeedback('success', `Account for "${user.name}" is now ${newStatus}.`);
  };

  // 5. Handle Confirm Remove User (Soft Delete)
  const handleConfirmRemove = () => {
    if (!confirmRemoveUser) return;

    if (callerRole === 'ADMIN' && confirmRemoveUser.role === 'OWNER') {
      showFeedback('error', 'Administrators are not permitted to remove Owner accounts.');
      setConfirmRemoveUser(null);
      return;
    }

    const store = getStore();
    const adminId = store.currentUser?.id || 'user-admin-sanjay';
    const removedTimestamp = new Date().toISOString();

    const updated = users.map(u => {
      if (u.id === confirmRemoveUser.id) {
        return {
          ...u,
          status: 'REMOVED' as const,
          removedAt: removedTimestamp,
          removedBy: adminId
        };
      }
      return u;
    });

    saveStore({ users: updated });
    setUsers(updated);

    recordAudit(
      'REMOVE',
      confirmRemoveUser,
      `Soft-deleted user account. Access revoked; user marked as REMOVED and cannot log in.`
    );

    showFeedback('success', `User "${confirmRemoveUser.name}" has been removed. You can restore this account anytime from Removed Users.`);
    setConfirmRemoveUser(null);
  };

  // 6. Handle Restore User
  const handleRestoreUser = (user: User) => {
    const updated = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          status: 'ACTIVE' as const,
          removedAt: undefined,
          removedBy: undefined
        };
      }
      return u;
    });

    saveStore({ users: updated });
    setUsers(updated);

    recordAudit(
      'RESTORE',
      user,
      `Restored previously removed account. Status reset to ACTIVE with login permissions restored.`
    );

    showFeedback('success', `User "${user.name}" has been successfully restored to ACTIVE.`);
  };

  // Filtered Users List
  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.personalEmail && user.personalEmail.toLowerCase().includes(q)) ||
      user.phone.toLowerCase().includes(q) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(q)) ||
      (user.assignedSection && user.assignedSection.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesClass = classFilter === 'ALL' || user.assignedClass === classFilter;
    
    let matchesStatus = true;
    const userStatus = user.status || 'ACTIVE';
    if (statusFilter === 'ACTIVE_AND_INACTIVE') {
      matchesStatus = userStatus !== 'REMOVED';
    } else if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else {
      matchesStatus = userStatus === statusFilter;
    }

    return matchesSearch && matchesRole && matchesClass && matchesStatus;
  });

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const q = auditSearch.toLowerCase().trim();
    return !q ||
      log.targetUserName.toLowerCase().includes(q) ||
      log.performedByName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'TEACHER':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'STAFF':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'PARENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'STUDENT':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ROLE_CHANGE':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'PASSWORD_RESET':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'STATUS_CHANGE':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'REMOVE':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold';
      case 'RESTORE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] uppercase tracking-wider">
              {callerRole === 'OWNER' ? 'Owner Master Console' : 'Administrative Enrollment Portal'}
            </span>
            <span className="text-xs text-slate-500 font-medium">London Kids Preschool Avalurpet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users size={28} className="text-red-600" />
            <span>User Enrollment &amp; Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enroll, audit, and administer all Owner, Administrator, Faculty, Staff, Parent, and Student accounts.
          </p>
        </div>

        {/* Tab Navigation Pill Group */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'DIRECTORY' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={16} />
            <span>Directory ({users.length})</span>
          </button>

          <button
            onClick={() => {
              setEnrollForm(f => ({ ...f, password: generateRandomPassword() }));
              setActiveTab('ENROLL');
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'ENROLL' 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={16} />
            <span>Enroll New User</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={16} />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between transition-all animate-fadeIn ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-rose-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: USER DIRECTORY
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Stat counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { label: 'Total Users', count: users.length, color: 'text-slate-800', bg: 'bg-white' },
              { label: 'Active', count: users.filter(u => (u.status || 'ACTIVE') === 'ACTIVE').length, color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
              { label: 'Inactive', count: users.filter(u => u.status === 'INACTIVE').length, color: 'text-amber-600', bg: 'bg-amber-50/60' },
              { label: 'Removed', count: users.filter(u => u.status === 'REMOVED').length, color: 'text-rose-600', bg: 'bg-rose-50/60' },
              { label: 'Teachers', count: users.filter(u => u.role === 'TEACHER').length, color: 'text-sky-600', bg: 'bg-sky-50/60' },
              { label: 'Staff', count: users.filter(u => u.role === 'STAFF').length, color: 'text-teal-600', bg: 'bg-teal-50/60' },
              { label: 'Parents', count: users.filter(u => u.role === 'PARENT').length, color: 'text-purple-600', bg: 'bg-purple-50/60' },
              { label: 'Students', count: users.filter(u => u.role === 'STUDENT').length, color: 'text-indigo-600', bg: 'bg-indigo-50/60' },
            ].map(item => (
              <div key={item.label} className={`${item.bg} p-3 rounded-2xl border border-slate-200 shadow-2xs`}>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">{item.label}</span>
                <span className={`text-xl font-black ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col lg:flex-row gap-3 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search name, official/personal email, phone, ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Role filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>Role:</span>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="ALL">All Roles</option>
                  <option value="OWNER">Owner</option>
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher / Faculty</option>
                  <option value="STAFF">Staff</option>
                  <option value="PARENT">Parent</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              {/* Class filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>Class:</span>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="ALL">All Classes</option>
                  <option value="PLAY_SCHOOL">Play School</option>
                  <option value="NURSERY">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="ACTIVE_AND_INACTIVE">Active &amp; Inactive (Default)</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                  <option value="REMOVED">Removed Users (Soft-Deleted)</option>
                  <option value="ALL">All Accounts (Inc. Removed)</option>
                </select>
              </div>

              {(searchQuery || roleFilter !== 'ALL' || classFilter !== 'ALL' || statusFilter !== 'ACTIVE_AND_INACTIVE') && (
                <button
                  onClick={() => { setSearchQuery(''); setRoleFilter('ALL'); setClassFilter('ALL'); setStatusFilter('ACTIVE_AND_INACTIVE'); }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Role &amp; Credentials</th>
                    <th className="py-3.5 px-4">Personal Email &amp; Verification</th>
                    <th className="py-3.5 px-4">Class / Section / ID</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users size={36} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-sm">No users match the selected filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const isRemoved = user.status === 'REMOVED';
                      const isActive = (user.status || 'ACTIVE') === 'ACTIVE';

                      return (
                        <tr key={user.id} className={`transition-colors ${isRemoved ? 'bg-rose-50/50 hover:bg-rose-50/80' : 'hover:bg-slate-50/80'}`}>
                          {/* Name + Avatar */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.photo || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt={user.name}
                                className={`w-10 h-10 rounded-full object-cover border-2 shrink-0 ${isRemoved ? 'border-rose-300 opacity-60' : 'border-slate-200'}`}
                              />
                              <div>
                                <span className={`font-black text-sm block ${isRemoved ? 'text-slate-500 line-through decoration-rose-400' : 'text-slate-800'}`}>
                                  {user.name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                                  <Phone size={11} className="text-emerald-600" />
                                  {user.phone}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge + Must Change Password */}
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider inline-block ${getRoleBadge(user.role)}`}>
                              {user.role}
                            </span>
                            {user.mustChangePassword && !isRemoved && (
                              <span className="ml-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-bold inline-block" title="Temporary password in use">
                                Temp Pwd
                              </span>
                            )}
                          </td>

                          {/* Personal Email */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                                <Mail size={12} className="text-red-500 shrink-0" />
                                <span className="truncate max-w-[200px]">{user.personalEmail || user.email}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {user.emailVerified !== false ? (
                                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                                    ✓ Verified
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                                    ⏳ Pending Verify
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Class / Section / Employee ID */}
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-700">
                              {user.employeeId && (
                                <p className="font-bold text-slate-800">
                                  ID: <span className="font-mono text-red-600">{user.employeeId}</span>
                                </p>
                              )}
                              {user.assignedClass && (
                                <p className="font-medium text-slate-600">
                                  Class: <strong>{user.assignedClass}</strong>
                                </p>
                              )}
                              {user.assignedSection && (
                                <p className="text-[10px] text-slate-500">
                                  Sec: {user.assignedSection}
                                </p>
                              )}
                              {user.role === 'PARENT' && (
                                <p className="text-[10px] text-slate-600 font-medium">
                                  {user.studentIds && user.studentIds.length > 0
                                    ? `${user.studentIds.length} Child${user.studentIds.length > 1 ? 'ren' : ''} Linked`
                                    : (user.studentId ? `Child: ${user.studentId}` : 'No child linked')}
                                </p>
                              )}
                              {!user.employeeId && !user.assignedClass && !user.assignedSection && !user.studentId && (!user.studentIds || user.studentIds.length === 0) && (
                                <span className="text-slate-400">—</span>
                              )}
                            </div>
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-4">
                            {isRemoved ? (
                              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 bg-rose-100 text-rose-800 border border-rose-300 w-fit">
                                <span className="w-2 h-2 rounded-full bg-rose-600" />
                                <span>Removed</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                title="Click to toggle Active / Inactive"
                                className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 transition-all shadow-2xs ${
                                  isActive 
                                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300' 
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span>{isActive ? 'Active' : 'Inactive'}</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Profile */}
                              <button
                                onClick={() => setViewingUser(user)}
                                title="View Complete Profile & Audit History"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Edit Details */}
                              <button
                                onClick={() => {
                                  setModalError('');
                                  setEditingUser({ ...user });
                                }}
                                title="Edit User Information"
                                className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer"
                              >
                                <Edit size={15} />
                              </button>

                              {/* Reset Password */}
                              {!isRemoved && (
                                <button
                                  onClick={() => {
                                    setResetPwdUser(user);
                                    setTempPassword(generateRandomPassword());
                                  }}
                                  title="Reset Temporary Password"
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                                >
                                  <Key size={15} />
                                </button>
                              )}

                              {/* Remove or Restore Action */}
                              {isRemoved ? (
                                <button
                                  onClick={() => handleRestoreUser(user)}
                                  title="Restore User Account"
                                  className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
                                >
                                  <RotateCcw size={13} />
                                  <span>Restore</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => setConfirmRemoveUser(user)}
                                  title="Remove User (Soft Delete)"
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: USER ENROLLMENT FORM
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'ENROLL' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <UserPlus size={22} className="text-red-600" />
                <span>New User Enrollment Registration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register official preschool staff, faculty, administrators, owners, parents, or student accounts.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel &amp; Return to Directory
            </button>
          </div>

          <form onSubmit={handleEnrollUser} className="space-y-6">
            {/* Section 1: Basic Identity & Role */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>1. Core Identity &amp; System Role</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={e => setEnrollForm({ ...enrollForm, name: e.target.value })}
                    placeholder="e.g. Ms. Kavitha Sundaram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Role *
                  </label>
                  <select
                    value={enrollForm.role}
                    onChange={e => setEnrollForm({ ...enrollForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  >
                    <option value="TEACHER">Teacher / Faculty</option>
                    <option value="STAFF">Staff (Support / Transport / Daycare)</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="OWNER">Owner / Director</option>
                    <option value="PARENT">Parent</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                {/* Account Status */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Account Status *
                  </label>
                  <select
                    value={enrollForm.status}
                    onChange={e => setEnrollForm({ ...enrollForm, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                  >
                    <option value="ACTIVE">Active (Immediate Portal Access)</option>
                    <option value="INACTIVE">Inactive (Access Suspended)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details & Personal Email */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                <Mail size={16} />
                <span>2. Contact Details &amp; Personal Email</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personal Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={enrollForm.personalEmail}
                    onChange={e => setEnrollForm({ ...enrollForm, personalEmail: e.target.value, email: e.target.value })}
                    placeholder="e.g. kavitha.teacher@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Primary login identifier &amp; communication email</span>
                </div>

                {/* Mobile Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={enrollForm.phone}
                    onChange={e => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    placeholder="+91 90436 33545"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Standard 10-digit school contact format</span>
                </div>
              </div>

              {/* Address & Date of Joining */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Residential / Communication Address
                  </label>
                  <input
                    type="text"
                    value={enrollForm.address}
                    onChange={e => setEnrollForm({ ...enrollForm, address: e.target.value })}
                    placeholder="Street, City, Postal Code"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Date of Joining / Enrollment
                  </label>
                  <input
                    type="date"
                    value={enrollForm.dateOfJoining}
                    onChange={e => setEnrollForm({ ...enrollForm, dateOfJoining: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Role-Specific Allocations */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                <GraduationCap size={16} />
                <span>3. Employee &amp; Academic Allocations</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Employee ID (for Staff/Faculty/Admin/Owner) */}
                {['OWNER', 'ADMIN', 'TEACHER', 'STAFF'].includes(enrollForm.role) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={enrollForm.employeeId}
                      onChange={e => setEnrollForm({ ...enrollForm, employeeId: e.target.value })}
                      placeholder="e.g. EMP-LK-105"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                  </div>
                )}

                {/* Assigned Class (for Teacher / Staff / Student) */}
                {['TEACHER', 'STAFF', 'STUDENT'].includes(enrollForm.role) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Class / Level
                    </label>
                    <select
                      value={enrollForm.assignedClass}
                      onChange={e => setEnrollForm({ ...enrollForm, assignedClass: e.target.value as SchoolLevel })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                    >
                      {SCHOOL_LEVELS.map(lvl => (
                        <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Assigned Section */}
                {['TEACHER', 'STAFF', 'STUDENT'].includes(enrollForm.role) && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assigned Section / Responsibility
                    </label>
                    <input
                      type="text"
                      list="section-options"
                      value={enrollForm.assignedSection}
                      onChange={e => setEnrollForm({ ...enrollForm, assignedSection: e.target.value })}
                      placeholder="e.g. Butterflies or Route 1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <datalist id="section-options">
                      {SECTION_OPTIONS.map(s => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                )}

                {/* Linked Child for Parent */}
                {enrollForm.role === 'PARENT' && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Link Enrolled Children / Students (Select one or more) *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-300 bg-slate-50/50">
                      {students.map(s => {
                        const isSelected = (enrollForm.studentIds || []).includes(s.id) || enrollForm.studentId === s.id;
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const currentIds = enrollForm.studentIds?.length 
                                  ? [...enrollForm.studentIds] 
                                  : (enrollForm.studentId ? [enrollForm.studentId] : []);
                                let nextIds: string[];
                                if (e.target.checked) {
                                  nextIds = Array.from(new Set([...currentIds, s.id]));
                                } else {
                                  nextIds = currentIds.filter(id => id !== s.id);
                                }
                                setEnrollForm({
                                  ...enrollForm,
                                  studentIds: nextIds,
                                  studentId: nextIds[0] || ''
                                });
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500"
                            />
                            <span className="truncate">
                              {s.name} ({s.level} - {s.section})
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Selected: {(enrollForm.studentIds || []).length || (enrollForm.studentId ? 1 : 0)} child(ren) linked
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Profile Photo & Security Credentials */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center gap-2">
                <Lock size={16} />
                <span>4. Profile Avatar &amp; Temporary Access Credentials</span>
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                  <PhotoUploadDropzone
                    currentPhoto={enrollForm.photo}
                    onPhotoChange={(newPhoto) => setEnrollForm({ ...enrollForm, photo: newPhoto })}
                    targetRole={enrollForm.role}
                    label="Upload Profile Photo"
                    subtitle={`Upload photo of the new ${enrollForm.role.toLowerCase()} (from device) or pick a preset.`}
                    size="md"
                  />
                </div>

                <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Temporary Password (Forces update upon first login)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={enrollForm.password}
                      onChange={e => setEnrollForm({ ...enrollForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => setEnrollForm({ ...enrollForm, password: generateRandomPassword() })}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shrink-0 cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
                    🔒 The user will be required to set their permanent personal password immediately upon first login.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('DIRECTORY')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-red-200 transition-all flex items-center gap-2"
              >
                <UserCheck size={16} />
                <span>Complete Enrollment &amp; Register User</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: AUDIT LOG TRAIL
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <History size={18} className="text-red-600" />
                <span>Administrative Audit Trail History</span>
              </h2>
              <p className="text-xs text-slate-500">
                Detailed chronological log recording all user creations, role changes, password resets, and status alterations.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audit records..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target User &amp; Role</th>
                    <th className="py-3 px-4">Authorized Admin</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No audit records match your query.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400" />
                            <span>{log.timestamp}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${getActionBadge(log.action)}`}>
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">{log.targetUserName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase">{log.targetUserRole}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {log.performedByName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 leading-relaxed text-[11px]">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: VIEW FULL USER DETAILS
      ─────────────────────────────────────────────────────────────── */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-100 relative animate-scaleUp space-y-6">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <img
                src={viewingUser.photo || viewingUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={viewingUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-red-200 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadge(viewingUser.role)}`}>
                    {viewingUser.role}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${viewingUser.status === 'INACTIVE' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {viewingUser.status || 'ACTIVE'}
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-900 mt-1">
                  {viewingUser.name}
                </h3>
                {viewingUser.employeeId && (
                  <p className="text-xs text-red-600 font-mono font-bold">
                    Employee ID: {viewingUser.employeeId}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Personal Email Address</span>
                <span className="font-bold text-slate-800 text-sm">{viewingUser.personalEmail || viewingUser.email}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Mobile Number</span>
                <span className="font-bold text-slate-800">{viewingUser.phone}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Date of Joining</span>
                <span className="font-bold text-slate-800">{viewingUser.dateOfJoining || viewingUser.createdAt || 'N/A'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Address</span>
                <span className="font-semibold text-slate-700">{viewingUser.address || 'Avalurpet, Tamil Nadu'}</span>
              </div>

              {viewingUser.assignedClass && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Class</span>
                  <span className="font-bold text-slate-800">{viewingUser.assignedClass}</span>
                </div>
              )}

              {viewingUser.assignedSection && (
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Section / Duty</span>
                  <span className="font-bold text-slate-800">{viewingUser.assignedSection}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Email Verification Status</span>
                <span className={`font-bold text-xs inline-flex items-center gap-1.5 ${viewingUser.emailVerified !== false ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {viewingUser.emailVerified !== false ? '✓ Verified' : '⏳ Pending Email Verification'}
                </span>
              </div>

              {viewingUser.role === 'PARENT' && (
                <div className="bg-slate-50 p-3 rounded-xl sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Linked Children ({((viewingUser.studentIds && viewingUser.studentIds.length > 0) ? viewingUser.studentIds : (viewingUser.studentId ? [viewingUser.studentId] : [])).length})
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {(() => {
                      const ids = (viewingUser.studentIds && viewingUser.studentIds.length > 0) 
                        ? viewingUser.studentIds 
                        : (viewingUser.studentId ? [viewingUser.studentId] : []);
                      if (ids.length === 0) return <span className="text-xs text-slate-400">No children linked</span>;
                      return ids.map(sId => {
                        const st = students.find(s => s.id === sId);
                        return (
                          <span key={sId} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
                            {st ? `${st.name} (${st.level} - ${st.section})` : sId}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Audit History for this user */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                User Activity Audit Trail
              </span>
              <div className="max-h-32 overflow-y-auto space-y-1.5 text-xs">
                {auditLogs.filter(l => l.targetUserId === viewingUser.id).length === 0 ? (
                  <p className="text-slate-400 text-[11px]">No specific audit logs recorded for this account.</p>
                ) : (
                  auditLogs.filter(l => l.targetUserId === viewingUser.id).map(l => (
                    <div key={l.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between gap-2 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{l.action}: </span>
                        <span className="text-slate-600">{l.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">{l.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setViewingUser(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: EDIT USER INFORMATION
      ─────────────────────────────────────────────────────────────── */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-100 relative animate-scaleUp space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Edit size={18} className="text-sky-600" />
                <span>Edit User Profile &amp; Role</span>
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              {/* Photo Upload in Edit Modal */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                <PhotoUploadDropzone
                  currentPhoto={editingUser.photo || editingUser.avatar || ''}
                  onPhotoChange={(newPhoto) => setEditingUser({ ...editingUser, photo: newPhoto, avatar: newPhoto })}
                  targetRole={editingUser.role}
                  label="Update Profile Photo"
                  subtitle="Upload an updated photo from your computer or pick a role preset."
                  size="sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role *</label>
                  <select
                    value={editingUser.role}
                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="ADMIN">Admin</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="STAFF">Staff</option>
                    <option value="PARENT">Parent</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status || 'ACTIVE'}
                    onChange={e => setEditingUser({ ...editingUser, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.personalEmail || editingUser.email || ''}
                  onChange={e => setEditingUser({ ...editingUser, personalEmail: e.target.value, email: e.target.value })}
                  placeholder="e.g. user@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Unique login identifier and communication email</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editingUser.phone}
                    onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editingUser.employeeId || ''}
                    onChange={e => setEditingUser({ ...editingUser, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Class</label>
                  <select
                    value={editingUser.assignedClass || 'LKG'}
                    onChange={e => setEditingUser({ ...editingUser, assignedClass: e.target.value as SchoolLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold bg-white"
                  >
                    {SCHOOL_LEVELS.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Section / Duty</label>
                  <input
                    type="text"
                    value={editingUser.assignedSection || ''}
                    onChange={e => setEditingUser({ ...editingUser, assignedSection: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              {/* Linked Children for Parent */}
              {editingUser.role === 'PARENT' && (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 text-xs">
                    Link Enrolled Children / Students (Select one or more)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 rounded-xl border border-slate-300 bg-slate-50/50">
                    {students.map(s => {
                      const currentIds = (editingUser.studentIds && editingUser.studentIds.length > 0)
                        ? editingUser.studentIds
                        : (editingUser.studentId ? [editingUser.studentId] : []);
                      const isSelected = currentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              let nextIds: string[];
                              if (e.target.checked) {
                                nextIds = Array.from(new Set([...currentIds, s.id]));
                              } else {
                                nextIds = currentIds.filter(id => id !== s.id);
                              }
                              setEditingUser({
                                ...editingUser,
                                studentIds: nextIds,
                                studentId: nextIds[0] || ''
                              });
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="truncate">
                            {s.name} ({s.level} - {s.section})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Verification</label>
                  <select
                    value={editingUser.emailVerified !== false ? 'VERIFIED' : 'PENDING'}
                    onChange={e => setEditingUser({ ...editingUser, emailVerified: e.target.value === 'VERIFIED' })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white text-xs"
                  >
                    <option value="VERIFIED">Verified (Can log in)</option>
                    <option value="PENDING">Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={editingUser.address || ''}
                    onChange={e => setEditingUser({ ...editingUser, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-xs"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                  <span className="text-base shrink-0">⚠️</span>
                  <span>{modalError}</span>
                </div>
              )}

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setEditingUser(null); setModalError(''); }}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black shadow-md shadow-sky-200 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: RESET PASSWORD MODAL
      ─────────────────────────────────────────────────────────────── */}
      {resetPwdUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-amber-100 relative animate-scaleUp space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                <Key size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">
                  Reset Password
                </h3>
                <p className="text-xs text-slate-500">
                  For: <strong>{resetPwdUser.name}</strong> ({resetPwdUser.role})
                </p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  New Temporary Password
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-red-600"
                  />
                  <button
                    type="button"
                    onClick={() => setTempPassword(generateRandomPassword())}
                    className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                  >
                    Regen
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                ℹ️ The user will be required to change this temporary password upon their next successful login.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setResetPwdUser(null); setTempPassword(''); }}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200"
                >
                  Save &amp; Issue Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: CONFIRM REMOVE USER MODAL (SOFT DELETE)
      ─────────────────────────────────────────────────────────────── */}
      {confirmRemoveUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-100 relative animate-scaleUp space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 leading-tight">
                  Remove User Account?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove this user from the active directory?
                </p>
              </div>
            </div>

            {/* User Details Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <img
                src={confirmRemoveUser.photo || confirmRemoveUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={confirmRemoveUser.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 truncate">{confirmRemoveUser.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${getRoleBadge(confirmRemoveUser.role)}`}>
                    {confirmRemoveUser.role}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  Official: {confirmRemoveUser.email}
                </p>
                {confirmRemoveUser.personalEmail && (
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    Personal: {confirmRemoveUser.personalEmail}
                  </p>
                )}
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Phone: {confirmRemoveUser.phone}
                </p>
              </div>
            </div>

            {/* Information / Safety Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle size={15} />
                <span>Soft Delete &amp; Revocation Protection</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800/90">
                This account will be marked as <strong>REMOVED</strong> and immediately blocked from logging in. All historical data, records, and assignments are safely preserved and can be restored at any time via the <em>Removed Users</em> filter.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmRemoveUser(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel, Keep User
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Yes, Remove User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
