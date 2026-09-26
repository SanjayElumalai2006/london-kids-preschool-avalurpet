'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Calendar, CheckCircle2, AlertTriangle, 
  Search, Phone, Mail, BookOpen, Clock, Heart, 
  ShieldCheck, Send, Sparkles, Plus, Download, IndianRupee
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { Student, AttendanceStatus, SchoolLevel, Notice, User } from '@/types';

export default function StaffPortalPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'TRANSPORT' | 'NOTICES'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | 'ALL'>('ALL');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  const [staffNotice, setStaffNotice] = useState({
    title: '',
    content: '',
    category: 'Circular' as Notice['category'],
    targetLevel: 'ALL' as SchoolLevel | 'ALL'
  });
  const [noticeSaved, setNoticeSaved] = useState(false);

  const loadData = () => {
    const store = getStore();
    setCurrentUser(store.currentUser);
    const activeStudents = store.students.filter(s => s.status === 'ACTIVE' || !s.status);
    setStudents(activeStudents);
    setNotices(store.notices || []);

    const initialMap: Record<string, AttendanceStatus> = {};
    activeStudents.forEach(s => {
      initialMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(initialMap);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  const handleStatusToggle = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const today = new Date().toISOString().split('T')[0];
    const marker = currentUser?.name ? `${currentUser.name} (Campus Support Staff)` : 'Campus Staff';

    const newRecords = Object.entries(attendanceMap).map(([sId, status]) => ({
      id: `att-${Date.now()}-${sId}`,
      studentId: sId,
      date: today,
      status,
      markedBy: marker
    }));

    saveStore({
      attendance: [...newRecords, ...store.attendance]
    });

    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffNotice.title.trim() || !staffNotice.content.trim()) return;

    const store = getStore();
    const newNotice: Notice = {
      id: `not-staff-${Date.now()}`,
      title: staffNotice.title.trim(),
      content: staffNotice.content.trim(),
      targetLevel: staffNotice.targetLevel,
      date: new Date().toISOString().split('T')[0],
      authorName: currentUser?.name ? `${currentUser.name} (Support Staff)` : 'Campus Staff',
      priority: 'NORMAL',
      category: staffNotice.category
    };

    saveStore({
      notices: [newNotice, ...store.notices]
    });

    setNoticeSaved(true);
    setStaffNotice({
      title: '',
      content: '',
      category: 'Circular',
      targetLevel: 'ALL'
    });
    setTimeout(() => setNoticeSaved(false), 3000);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = !searchQuery.trim() || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      s.parentPhone.includes(searchQuery.trim());
    const matchesLevel = selectedLevel === 'ALL' || s.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const presentCount = Object.values(attendanceMap).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter(v => v === 'ABSENT').length;

  return (
    <div className="space-y-6">
      {/* Staff Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-teal-100 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px] uppercase">
              Campus Staff &amp; Operations Portal
            </span>
            <span className="text-xs text-slate-500 font-bold">Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            London Kids Support &amp; Transport Services
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Staff Member: <strong>{currentUser?.name || 'Staff Coordinator'}</strong> • Managed Students: <strong>{students.length} Kids</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-center min-w-24">
            <span className="text-[10px] uppercase font-bold text-teal-600 block">Total Kids</span>
            <p className="text-xl font-black text-teal-900">{students.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-24">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present</span>
            <p className="text-xl font-black text-emerald-900">{presentCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center min-w-24">
            <span className="text-[10px] uppercase font-bold text-rose-600 block">Absent</span>
            <p className="text-xl font-black text-rose-900">{absentCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Link to Classroom */}
      <div className="bg-linear-to-r from-sky-50 to-teal-50 rounded-2xl p-4 border border-teal-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            🏫
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Need to record classroom reviews, activities or homework?</h3>
            <p className="text-xs text-slate-500">Access the full Educator &amp; Classroom portal for grade reviews and photo uploads.</p>
          </div>
        </div>
        <Link
          href="/portal/teacher"
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
        >
          <span>Open Classroom Portal →</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Student Directory & Emergency', icon: '📋' },
          { id: 'ATTENDANCE', label: 'Daily Roll Call', icon: '📅' },
          { id: 'TRANSPORT', label: 'Transport & Safety Contacts', icon: '🚌' },
          { id: 'NOTICES', label: 'Staff Notices & Circulars', icon: '📢' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs cursor-pointer ${
              activeTab === tab.id
                ? 'bg-teal-700 text-white shadow-md shadow-teal-200 scale-102'
                : 'bg-white text-slate-700 hover:bg-teal-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & DIRECTORY */}
      {activeTab === 'OVERVIEW' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Student Care &amp; Contact Directory</h2>
              <p className="text-xs text-slate-500">Immediate access to emergency numbers, blood group, and parent contact.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search child, parent, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Levels</option>
                <option value="PLAY_SCHOOL">Play School</option>
                <option value="NURSERY">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">Parent Name</th>
                  <th className="py-3 px-4">Parent Phone</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Medical / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2.5">
                      <img
                        src={st.photo || 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=100&auto=format&fit=crop&q=80'}
                        alt={st.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span>{st.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">{st.admissionNo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                        {st.level.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-rose-600">{st.bloodGroup || 'O+'}</td>
                    <td className="py-3 px-4 text-slate-700">{st.parentName}</td>
                    <td className="py-3 px-4">
                      <a href={`tel:${st.parentPhone}`} className="text-teal-600 hover:underline font-mono font-bold flex items-center gap-1">
                        <Phone size={12} /> {st.parentPhone}
                      </a>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{st.emergencyContact || st.parentPhone}</td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{st.medicalNotes || 'Healthy'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY ROLL CALL */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Campus-Wide Daily Attendance Roll Call</h2>
              <p className="text-xs text-slate-500">
                Date: <strong>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
            </div>
            {attendanceSaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Attendance Saved Successfully!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAttendance} className="space-y-4">
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Parent Phone</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {st.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{st.admissionNo}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{st.level.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{st.parentPhone}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-1.5">
                          {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map(status => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusToggle(st.id, status)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                                attendanceMap[st.id] === status
                                  ? status === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : status === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md shadow-teal-200 transition-colors cursor-pointer"
              >
                Submit Campus Attendance
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TRANSPORT & SAFETY */}
      {activeTab === 'TRANSPORT' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Van &amp; Transport Logistics</h2>
            <p className="text-xs text-slate-500">Pick-up and drop coordination for Avalurpet preschool van routes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-800">🚐 Van Route 1: Avalurpet Town &amp; Bus Stand</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coverage: Main Road, Bazaar Street, Near Bus Stand, Gandhi Road.
              </p>
              <div className="text-xs font-medium text-slate-700 space-y-1">
                <p>Morning Pickup: <strong>8:00 AM – 8:25 AM</strong></p>
                <p>Afternoon Drop: <strong>1:35 PM – 2:00 PM</strong></p>
                <p>Driver / In-charge: <strong>Mr. Selvam (+91 98405 67890)</strong></p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-sm text-slate-800">🚐 Van Route 2: Lake View &amp; Surrounding Villages</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Active</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Coverage: Lake View Nagar, Temple Road, Postal Colony, West Quarters.
              </p>
              <div className="text-xs font-medium text-slate-700 space-y-1">
                <p>Morning Pickup: <strong>7:45 AM – 8:15 AM</strong></p>
                <p>Afternoon Drop: <strong>1:45 PM – 2:15 PM</strong></p>
                <p>Driver / In-charge: <strong>Mr. Murugan (+91 97890 34567)</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTICES */}
      {activeTab === 'NOTICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Broadcast Campus Circular / Notice</h2>
              <p className="text-xs text-slate-500">Post announcements to parent and staff portals.</p>
            </div>
            {noticeSaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Notice Broadcasted!
              </span>
            )}
          </div>

          <form onSubmit={handlePublishNotice} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Class</label>
                <select
                  value={staffNotice.targetLevel}
                  onChange={e => setStaffNotice({ ...staffNotice, targetLevel: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="ALL">All School Levels</option>
                  <option value="PLAY_SCHOOL">Play School</option>
                  <option value="NURSERY">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={staffNotice.category}
                  onChange={e => setStaffNotice({ ...staffNotice, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  <option value="Circular">Circular</option>
                  <option value="Event">Event</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Homework">Homework / Task</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Van Route Timing Update / Special Activity Notice"
                value={staffNotice.title}
                onChange={e => setStaffNotice({ ...staffNotice, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Notice Details</label>
              <textarea
                required
                rows={4}
                placeholder="Write announcement details..."
                value={staffNotice.content}
                onChange={e => setStaffNotice({ ...staffNotice, content: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
            >
              Broadcast Notice
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
