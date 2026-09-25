'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, DollarSign, Calendar, FileText, 
  Search, Plus, CheckCircle2, AlertTriangle, 
  Sparkles, Mail, Phone, Download, Send, UserPlus, Camera, Trash2
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { Student, SchoolLevel, AdmissionEnquiry, FeeInvoice, Notice, EventPhoto, GalleryCategory } from '@/types';
import PhotoUploadDropzone from '@/components/PhotoUploadDropzone';
import EventPhotoUploadModal from '@/components/EventPhotoUploadModal';

export default function AdminPortalPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'ENQUIRIES' | 'FEES' | 'NOTICES' | 'GALLERY'>('STUDENTS');
  const [galleryPhotos, setGalleryPhotos] = useState<EventPhoto[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [galleryCatFilter, setGalleryCatFilter] = useState<GalleryCategory>('ALL');
  const [lightboxPhoto, setLightboxPhoto] = useState<EventPhoto | null>(null);
  const [levelFilter, setLevelFilter] = useState<SchoolLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add & Edit Student Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    dob: '',
    gender: 'Male' as Student['gender'],
    level: 'PLAY_SCHOOL' as SchoolLevel,
    section: 'Little Cubs',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    medicalNotes: '',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'
  });

  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    targetLevel: 'ALL' as SchoolLevel | 'ALL',
    category: 'Circular' as Notice['category']
  });
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [reminderToast, setReminderToast] = useState('');

  const loadData = () => {
    const store = getStore();
    setStudents(store.students);
    setEnquiries(store.enquiries);
    setInvoices(store.invoices);
    setNotices(store.notices);
    setGalleryPhotos(store.gallery || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  const [studentStatusFilter, setStudentStatusFilter] = useState<'ACTIVE' | 'REMOVED' | 'ALL'>('ACTIVE');

  const filteredStudents = students.filter(s => {
    const isStudentActive = s.status === 'ACTIVE' || !s.status;
    const matchesStatus = studentStatusFilter === 'ALL' 
      ? true 
      : (studentStatusFilter === 'ACTIVE' ? isStudentActive : s.status === 'REMOVED');
    const matchesLevel = levelFilter === 'ALL' || s.level === levelFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesLevel && matchesSearch;
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const admNo = `ADM-2026-${newStudent.level}-${Math.floor(10 + Math.random() * 90)}`;
    const studentId = `stud-${Date.now()}`;

    const createdStudent: Student = {
      id: studentId,
      admissionNo: admNo,
      name: newStudent.name,
      dob: newStudent.dob || '2023-01-01',
      gender: newStudent.gender,
      level: newStudent.level,
      section: newStudent.section,
      rollNo: String(store.students.filter(s => (s.status === 'ACTIVE' || !s.status) && s.level === newStudent.level).length + 1).padStart(2, '0'),
      bloodGroup: 'B+',
      photo: newStudent.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
      parentId: `user-parent-${Date.now()}`,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      parentEmail: newStudent.parentEmail,
      teacherId: 'user-teacher-lkg',
      teacherName: 'Ms. Meena Devi',
      emergencyContact: newStudent.parentPhone,
      medicalNotes: newStudent.medicalNotes || 'None',
      admissionDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Create corresponding fee invoice
    const feeAmount = store.settings.fees[newStudent.level] || 3000;
    const newInvoice: FeeInvoice = {
      id: `inv-${Date.now()}`,
      studentId,
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      totalAnnualFee: feeAmount,
      paidAmount: 0,
      dueAmount: feeAmount,
      dueDate: '2026-10-30',
      status: 'PENDING',
      term: 'Academic Year 2026-27 (Annual)',
      receipts: []
    };

    saveStore({
      students: [createdStudent, ...store.students],
      invoices: [newInvoice, ...store.invoices]
    });

    setAddModalOpen(false);
    setNewStudent({
      name: '',
      dob: '',
      gender: 'Male',
      level: 'PLAY_SCHOOL',
      section: 'Little Cubs',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      medicalNotes: '',
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80'
    });
  };

  const handleSaveEditingStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    const store = getStore();
    const updated = store.students.map(s => s.id === editingStudent.id ? { ...editingStudent, updatedAt: new Date().toISOString() } : s);
    saveStore({ students: updated });
    setStudents(updated);
    setReminderToast(`Student "${editingStudent.name}" details updated successfully!`);
    setTimeout(() => setReminderToast(''), 3500);
    setEditingStudent(null);
  };

  const handleRemoveStudent = (studentId: string) => {
    const store = getStore();
    const adminId = store.currentUser?.id || 'user-admin-sanjay';
    const updated = store.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: 'REMOVED' as const,
          removedAt: new Date().toISOString(),
          removedBy: adminId,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    saveStore({ students: updated });
    setStudents(updated);
    setReminderToast('Student moved to Removed/Inactive records.');
    setTimeout(() => setReminderToast(''), 3500);
  };

  const handleRestoreStudent = (studentId: string) => {
    const store = getStore();
    const updated = store.students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: 'ACTIVE' as const,
          removedAt: undefined,
          removedBy: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    });
    saveStore({ students: updated });
    setStudents(updated);
    setReminderToast('Student profile restored to ACTIVE roster successfully.');
    setTimeout(() => setReminderToast(''), 3500);
  };

  const handleUpdateEnquiryStatus = (id: string, status: AdmissionEnquiry['status']) => {
    const store = getStore();
    const updated = store.enquiries.map(e => e.id === id ? { ...e, status } : e);
    saveStore({ enquiries: updated });
  };

  const handleSendReminder = (studentName: string, phone: string) => {
    setReminderToast(`Payment reminder SMS & WhatsApp dispatched to ${studentName}'s parent at ${phone}!`);
    setTimeout(() => setReminderToast(''), 3500);
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const notice: Notice = {
      id: `not-${Date.now()}`,
      title: newNotice.title,
      content: newNotice.content,
      targetLevel: newNotice.targetLevel,
      date: new Date().toISOString().split('T')[0],
      authorName: 'Mr. Rajesh Kumar (Admin)',
      priority: 'NORMAL',
      category: newNotice.category
    };

    saveStore({ notices: [notice, ...store.notices] });
    setNoticeSuccess(true);
    setNewNotice({ title: '', content: '', targetLevel: 'ALL', category: 'Circular' });
    setTimeout(() => setNoticeSuccess(false), 3000);
  };

  const handleRemovePhoto = (photoId: string) => {
    if (!confirm('Are you sure you want to remove this photo from the school gallery?')) return;
    const store = getStore();
    const updated = (store.gallery || []).filter(p => p.id !== photoId);
    saveStore({ gallery: updated });
    setGalleryPhotos(updated);
    setReminderToast('Event photo removed from gallery successfully.');
    setTimeout(() => setReminderToast(''), 3500);
  };

  const totalDues = invoices.reduce((acc, curr) => acc + curr.dueAmount, 0);

  return (
    <div className="space-y-6">
      {/* Admin KPI Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-100 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px] uppercase">
            Operations & Admissions
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            School Administrative Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Administrator: <strong>Mr. Rajesh Kumar</strong> • London Kids Preschool Avalurpet
          </p>
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal/admin/enrollment"
            className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <UserPlus size={16} />
            <span>User Enrollment</span>
          </Link>
          <Link
            href="/portal/admin/users"
            className="px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Users size={16} />
            <span>Users Directory</span>
          </Link>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Admit New Student</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled Students</span>
          <p className="text-2xl font-black text-slate-800">
            {students.filter(s => s.status === 'ACTIVE' || !s.status).length} Kids
          </p>
          <p className="text-[11px] text-slate-500">Active across 4 Program Levels</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">New Website Enquiries</span>
          <p className="text-2xl font-black text-orange-600">
            {enquiries.filter(e => e.status === 'NEW').length} Pending
          </p>
          <p className="text-[11px] text-slate-500">{enquiries.length} Total Submissions</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Outstanding Fee Dues</span>
          <p className="text-2xl font-black text-rose-600">${totalDues.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">
            {invoices.filter(i => i.dueAmount > 0).length} Unsettled Invoices
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Faculty Staff</span>
          <p className="text-2xl font-black text-emerald-600">14 Teachers</p>
          <p className="text-[11px] text-emerald-700 font-medium">100% Present Today</p>
        </div>
      </div>

      {reminderToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'STUDENTS', label: 'Student Admissions & Rosters', icon: '🎒' },
          { id: 'ENQUIRIES', label: 'Website Enquiries Inbox', icon: '📬' },
          { id: 'FEES', label: 'Fee Dues & Collections', icon: '💳' },
          { id: 'NOTICES', label: 'Broadcast Circulars', icon: '📢' },
          { id: 'GALLERY', label: 'School Events & Gallery', icon: '📸' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200 scale-102'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Students */}
      {activeTab === 'STUDENTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Student Directory & Records</h2>
              <p className="text-xs text-slate-500">
                Manage enrolled students across Nursery, Play School, LKG, and UKG.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student or parent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
              >
                <option value="ALL">All Levels</option>
                <option value="PLAY_SCHOOL">Play School</option>
                <option value="NURSERY">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>

              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold"
              >
                <option value="ACTIVE">Active Records</option>
                <option value="REMOVED">Removed Records</option>
                <option value="ALL">All Statuses</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Level & Section</th>
                  <th className="py-3 px-4">Parent Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Class Educator</th>
                  <th className="py-3 px-4">Medical Alert</th>
                  <th className="py-3 px-4 text-right">Photo &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={st.photo} alt={st.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 shadow-2xs shrink-0" />
                        <div>
                          <strong className="text-slate-800 block text-xs">{st.name}</strong>
                          <span className="text-[10px] text-slate-400">{st.admissionNo} • Roll {st.rollNo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                        {st.level}
                      </span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{st.section}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <strong className="block text-xs">{st.parentName}</strong>
                      <span className="text-[10px] text-slate-500">{st.parentPhone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {st.status === 'REMOVED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          <span>Removed</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{st.teacherName}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {st.medicalNotes !== 'None' ? (
                        <span className="text-rose-600 font-bold">{st.medicalNotes}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingStudent(st)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-800 font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Upload or change student photo"
                        >
                          <Camera size={13} className="text-amber-600" />
                          <span className="hidden sm:inline">Photo</span>
                        </button>
                        {st.status === 'REMOVED' ? (
                          <button
                            onClick={() => handleRestoreStudent(st.id)}
                            className="px-2.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Restore student to active roster"
                          >
                            <span>Restore</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRemoveStudent(st.id)}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Soft delete / remove student"
                          >
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Enquiries */}
      {activeTab === 'ENQUIRIES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Online Admission Enquiries</h2>
            <p className="text-xs text-slate-500">
              Live leads submitted by parents directly from the public website contact and enquiry forms.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Parent</th>
                  <th className="py-3 px-4">Child & Level</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {enquiries.map(enq => (
                  <tr key={enq.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{enq.parentName}</td>
                    <td className="py-3.5 px-4">
                      <strong>{enq.childName}</strong>
                      <span className="block text-[10px] text-orange-600 font-bold">
                        {enq.targetLevel} ({enq.childAge})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{enq.phone}</div>
                      <div className="text-[10px] text-slate-400">{enq.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">{enq.message}</td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">{enq.submittedAt}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value as any)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase ${
                            enq.status === 'NEW' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            enq.status === 'CONTACTED' ? 'bg-sky-100 text-sky-800 border-sky-200' :
                            'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <option value="NEW">New</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="ADMITTED">Admitted</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Fees */}
      {activeTab === 'FEES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Fee Status & Outstanding Dues</h2>
              <p className="text-xs text-slate-500">
                Track pending tuition dues, overdue alerts, and send instant WhatsApp/SMS reminders.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export Fee Report</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Total Fee</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Due Balance</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {invoices.map(inv => {
                  const studentObj = students.find(s => s.id === inv.studentId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {studentObj?.name || 'Student'}
                        <span className="block text-[10px] text-slate-400">{inv.invoiceNo}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">${inv.totalAnnualFee.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">${inv.paidAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-mono text-rose-600 font-bold">${inv.dueAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {inv.dueAmount > 0 ? (
                          <button
                            onClick={() => handleSendReminder(studentObj?.name || 'Student', studentObj?.parentPhone || '+1 (555) 000')}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] transition-colors"
                          >
                            Send Reminder
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Notices */}
      {activeTab === 'NOTICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Broadcast School Circular</h2>
              <p className="text-xs text-slate-500">
                Publish important announcements visible in the Parent & Teacher portals.
              </p>
            </div>
            {noticeSuccess && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Circular Broadcasted!
              </span>
            )}
          </div>

          <form onSubmit={handlePublishNotice} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Audience / Level *
                </label>
                <select
                  value={newNotice.targetLevel}
                  onChange={(e) => setNewNotice({ ...newNotice, targetLevel: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="ALL">Entire School (All Levels)</option>
                  <option value="PLAY_SCHOOL">Play School Only</option>
                  <option value="NURSERY">Nursery Only</option>
                  <option value="LKG">LKG Only</option>
                  <option value="UKG">UKG Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newNotice.category}
                  onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                >
                  <option value="Circular">General Circular</option>
                  <option value="Event">Event & Celebration</option>
                  <option value="Holiday">School Holiday</option>
                  <option value="Homework">General Homework</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Winter Holiday Schedule & Daycare Timings"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Content & Instructions *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Details of the announcement..."
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition-all flex items-center gap-2"
            >
              <Send size={16} />
              <span>Publish Circular</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Events & Gallery */}
      {activeTab === 'GALLERY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] uppercase">
                  Website Gallery CMS
                </span>
                <span className="text-xs text-slate-500 font-bold">{galleryPhotos.length} Total Photos</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">School Events &amp; Public Gallery</h2>
              <p className="text-xs text-slate-500">
                Post celebration photos, sports day moments, and campus activities directly to the website gallery and parent feeds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/gallery"
                target="_blank"
                className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>View Public Gallery</span>
                <span>↗</span>
              </Link>
              <button
                onClick={() => setEventModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md shadow-red-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Camera size={16} />
                <span>+ Post Event Photo</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {[
              { id: 'ALL' as const, label: 'All Photos' },
              { id: 'EVENTS' as const, label: '🎉 School Events' },
              { id: 'CLASSROOM' as const, label: '📚 Classroom' },
              { id: 'PLAY' as const, label: '🎠 Play & Sports' },
              { id: 'ARTS' as const, label: '🎨 Arts & Crafts' },
              { id: 'CAMPUS' as const, label: '🏫 Campus' },
            ].map((cat) => {
              const count = cat.id === 'ALL' ? galleryPhotos.length : galleryPhotos.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setGalleryCatFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    galleryCatFilter === cat.id
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    galleryCatFilter === cat.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Photos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(galleryCatFilter === 'ALL' ? galleryPhotos : galleryPhotos.filter(p => p.category === galleryCatFilter)).map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div 
                    className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxPhoto(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="bg-emerald-600/90 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Public Web
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span>{item.date}</span>
                      <span>By {item.uploadedBy || 'Admin'}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{item.caption}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setLightboxPhoto(item)}
                    className="text-red-600 hover:text-red-700 font-bold text-[11px] cursor-pointer"
                  >
                    View Fullscreen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {galleryPhotos.length === 0 && (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
              <Camera size={40} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No event photos posted yet</p>
              <p className="text-xs text-slate-500">Click below to upload photos from school events, sports day, or campus festivals.</p>
              <button
                onClick={() => setEventModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                + Post First Event Photo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox for Admin Gallery */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img src={lightboxPhoto.imageUrl} alt={lightboxPhoto.title} className="w-full max-h-[70vh] object-contain bg-slate-100" />
            <div className="p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600">{lightboxPhoto.category} • {lightboxPhoto.date}</span>
                <h3 className="font-black text-slate-800 text-lg">{lightboxPhoto.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{lightboxPhoto.caption}</p>
              </div>
              <button
                onClick={() => setLightboxPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Photo Upload Modal */}
      <EventPhotoUploadModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        currentUserName="Administrator"
        onSuccess={() => {
          loadData();
          setReminderToast('New event photo successfully published to the website!');
          setTimeout(() => setReminderToast(''), 3500);
        }}
      />

      {/* Add Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-100 relative animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800">
                Admit New Student
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3 text-xs">
              {/* Student Photo Upload */}
              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                <PhotoUploadDropzone
                  currentPhoto={newStudent.photo}
                  onPhotoChange={(photo) => setNewStudent({ ...newStudent, photo })}
                  targetRole="STUDENT"
                  label="Student Photo"
                  subtitle="Upload student photo file from device or choose a preset."
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Kapoor"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newStudent.dob}
                    onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">School Level *</label>
                  <select
                    value={newStudent.level}
                    onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="PLAY_SCHOOL">Play School</option>
                    <option value="NURSERY">Nursery</option>
                    <option value="LKG">LKG</option>
                    <option value="UKG">UKG</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Butterflies"
                    value={newStudent.section}
                    onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajiv Kapoor"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 90436 33545"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Parent Email *</label>
                <input
                  type="email"
                  required
                  placeholder="parent@example.com"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical or Allergy Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Peanut allergy, Asthma, None"
                  value={newStudent.medicalNotes}
                  onChange={(e) => setNewStudent({ ...newStudent, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition-colors cursor-pointer"
                >
                  Confirm &amp; Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student / Change Photo Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-100 relative animate-scaleUp space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">Student Profile &amp; Photo</h3>
                  <p className="text-xs text-slate-500">{editingStudent.admissionNo} • {editingStudent.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditingStudent} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <PhotoUploadDropzone
                  currentPhoto={editingStudent.photo}
                  onPhotoChange={(photo) => setEditingStudent({ ...editingStudent, photo })}
                  targetRole="STUDENT"
                  label="Upload Student Photo"
                  subtitle="Upload student photo file or select from preschool presets."
                  size="md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.section}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={editingStudent.parentName}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editingStudent.parentPhone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Medical or Allergy Notes</label>
                <input
                  type="text"
                  value={editingStudent.medicalNotes}
                  onChange={(e) => setEditingStudent({ ...editingStudent, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black shadow-md shadow-amber-200 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
