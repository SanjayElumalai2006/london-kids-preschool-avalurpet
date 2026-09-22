'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle2, AlertTriangle, 
  Camera, Star, BookOpen, Send, Plus, Sparkles 
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { Student, AttendanceStatus, ActivityPost, TeacherReview, StudentResult, Notice } from '@/types';
import PhotoUploadDropzone from '@/components/PhotoUploadDropzone';

export default function TeacherPortalPage() {
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'ACTIVITIES' | 'REVIEWS' | 'RESULTS' | 'NOTICES'>('ATTENDANCE');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Attendance state: Map of studentId -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);

  // New Activity form state
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    category: 'Sensory & Play' as ActivityPost['category'],
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80'
  });
  const [activitySaved, setActivitySaved] = useState(false);

  // New Review form state
  const [reviewStudentId, setReviewStudentId] = useState('');
  const [reviewForm, setReviewForm] = useState({
    socialSkills: 5,
    fineMotor: 4,
    languageCommunication: 5,
    emotionalRegulation: 4,
    comments: '',
    recommendations: ''
  });
  const [reviewSaved, setReviewSaved] = useState(false);

  // New Notice form state
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    category: 'Homework' as Notice['category']
  });
  const [noticeSaved, setNoticeSaved] = useState(false);

  const loadData = () => {
    const store = getStore();
    // Security Scoping: Teacher strictly accesses ONLY assigned class (LKG) and active students
    const lkgStudents = store.students.filter(s => (s.status === 'ACTIVE' || !s.status) && s.level === 'LKG');
    setClassStudents(lkgStudents);

    if (lkgStudents.length > 0 && !reviewStudentId) {
      setReviewStudentId(lkgStudents[0].id);
    }

    // Default all to PRESENT if not marked yet
    const initialMap: Record<string, AttendanceStatus> = {};
    lkgStudents.forEach(s => {
      initialMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(initialMap);
  };

  const handleSaveStudentPhoto = (newPhoto: string) => {
    if (!editingStudent) return;
    const store = getStore();
    const updated = store.students.map(s => s.id === editingStudent.id ? { ...s, photo: newPhoto, updatedAt: new Date().toISOString() } : s);
    saveStore({ students: updated });
    setClassStudents(updated.filter(s => (s.status === 'ACTIVE' || !s.status) && s.level === 'LKG'));
    setEditingStudent(null);
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

    const newRecords = Object.entries(attendanceMap).map(([sId, status]) => ({
      id: `att-${Date.now()}-${sId}`,
      studentId: sId,
      date: today,
      status,
      markedBy: 'Ms. Meena Devi (Class Teacher)'
    }));

    saveStore({
      attendance: [...newRecords, ...store.attendance]
    });

    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
  };

  const handlePostActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const newAct: ActivityPost = {
      id: `act-${Date.now()}`,
      level: 'LKG',
      title: newActivity.title,
      description: newActivity.description,
      date: new Date().toISOString().split('T')[0],
      imageUrl: newActivity.imageUrl,
      category: newActivity.category,
      createdBy: 'Ms. Meena Devi'
    };

    saveStore({
      activities: [newAct, ...store.activities]
    });

    setActivitySaved(true);
    setNewActivity({
      title: '',
      description: '',
      category: 'Sensory & Play',
      imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80'
    });
    setTimeout(() => setActivitySaved(false), 3000);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const avgRating = Math.round((reviewForm.socialSkills + reviewForm.fineMotor + reviewForm.languageCommunication + reviewForm.emotionalRegulation) / 4);

    const newRev: TeacherReview = {
      id: `rev-${Date.now()}`,
      studentId: reviewStudentId,
      teacherId: 'user-teacher-lkg',
      teacherName: 'Ms. Meena Devi',
      date: new Date().toISOString().split('T')[0],
      socialSkills: reviewForm.socialSkills,
      fineMotor: reviewForm.fineMotor,
      languageCommunication: reviewForm.languageCommunication,
      emotionalRegulation: reviewForm.emotionalRegulation,
      overallRating: avgRating,
      comments: reviewForm.comments || 'Participated actively in class circle and group activities.',
      recommendations: reviewForm.recommendations
    };

    saveStore({
      reviews: [newRev, ...store.reviews]
    });

    setReviewSaved(true);
    setTimeout(() => setReviewSaved(false), 3000);
  };

  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const newNot: Notice = {
      id: `not-${Date.now()}`,
      title: noticeForm.title,
      content: noticeForm.content,
      targetLevel: 'LKG',
      date: new Date().toISOString().split('T')[0],
      authorName: 'Ms. Meena Devi (Class Teacher)',
      priority: 'NORMAL',
      category: noticeForm.category
    };

    saveStore({
      notices: [newNot, ...store.notices]
    });

    setNoticeSaved(true);
    setNoticeForm({ title: '', content: '', category: 'Homework' });
    setTimeout(() => setNoticeSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-100 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase">
              Assigned Class
            </span>
            <span className="text-xs text-slate-500 font-bold">Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            LKG - Section A (Butterflies)
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Class Educator: <strong>Ms. Meena Devi</strong> • Total Students: <strong>{classStudents.length}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-center min-w-24">
            <span className="text-[10px] uppercase font-bold text-sky-600 block">Class Strength</span>
            <p className="text-xl font-black text-sky-900">{classStudents.length} Kids</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center min-w-24">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">Present Today</span>
            <p className="text-xl font-black text-emerald-900">
              {Object.values(attendanceMap).filter(v => v === 'PRESENT').length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'ATTENDANCE', label: 'Mark Attendance', icon: '📅' },
          { id: 'ACTIVITIES', label: 'Post Activity & Photos', icon: '📸' },
          { id: 'REVIEWS', label: 'Add Student Reviews', icon: '⭐' },
          { id: 'NOTICES', label: 'Share Homework & Notices', icon: '📝' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-md shadow-sky-200 scale-102'
                : 'bg-white text-slate-700 hover:bg-sky-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Mark Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Daily Class Attendance</h2>
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
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Parent Phone</th>
                    <th className="py-3 px-4">Mark Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {classStudents.map(st => {
                    const currentStatus = attendanceMap[st.id] || 'PRESENT';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-500">{st.rollNo}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setEditingStudent(st)}
                              className="relative group rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-400 shrink-0"
                              title="Click to upload or change student photo"
                            >
                              <img src={st.photo} alt={st.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 group-hover:border-sky-500 transition-colors shadow-2xs" />
                              <span className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera size={13} />
                              </span>
                            </button>
                            <div>
                              <strong className="text-slate-800 block text-xs">{st.name}</strong>
                              <span className="text-[10px] text-slate-400">{st.admissionNo}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{st.parentPhone}</td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 gap-1">
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(st.id, 'PRESENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentStatus === 'PRESENT' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(st.id, 'LATE')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentStatus === 'LATE' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(st.id, 'ABSENT')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                currentStatus === 'ABSENT' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={18} />
                <span>Submit & Sync Attendance</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Post Activity */}
      {activeTab === 'ACTIVITIES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Upload Classroom Activity & Photos</h2>
              <p className="text-xs text-slate-500">
                Moments posted here appear directly in your parents&apos; personal activity timeline!
              </p>
            </div>
            {activitySaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Activity Published!
              </span>
            )}
          </div>

          <form onSubmit={handlePostActivity} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Activity Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Clay Modeling Animals & Shapes"
                value={newActivity.title}
                onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Sensory & Play">Sensory & Play</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                  <option value="Music & Dance">Music & Dance</option>
                  <option value="Story & Phonics">Story & Phonics</option>
                  <option value="Outdoor Fun">Outdoor Fun</option>
                  <option value="Celebration">Celebration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo URL *
                </label>
                <input
                  type="url"
                  required
                  value={newActivity.imageUrl}
                  onChange={(e) => setNewActivity({ ...newActivity, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description & Learning Highlights *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what the children learned, explored, or built today..."
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition-all flex items-center gap-2"
            >
              <Camera size={18} />
              <span>Post to Parents&apos; Feed</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Add Reviews */}
      {activeTab === 'REVIEWS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Record Student Milestone Review</h2>
              <p className="text-xs text-slate-500">
                Rate key development areas and write encouraging remarks for parent visibility.
              </p>
            </div>
            {reviewSaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Review Saved & Published!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select LKG Student *
              </label>
              <select
                value={reviewStudentId}
                onChange={(e) => setReviewStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Roll: {s.rollNo} • {s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Social Interaction & Sharing</span>
                  <span className="text-sky-600">{reviewForm.socialSkills} / 5 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.socialSkills}
                  onChange={(e) => setReviewForm({ ...reviewForm, socialSkills: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Fine Motor Skills</span>
                  <span className="text-sky-600">{reviewForm.fineMotor} / 5 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.fineMotor}
                  onChange={(e) => setReviewForm({ ...reviewForm, fineMotor: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Language & Phonics</span>
                  <span className="text-sky-600">{reviewForm.languageCommunication} / 5 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.languageCommunication}
                  onChange={(e) => setReviewForm({ ...reviewForm, languageCommunication: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Emotional Regulation</span>
                  <span className="text-sky-600">{reviewForm.emotionalRegulation} / 5 ★</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewForm.emotionalRegulation}
                  onChange={(e) => setReviewForm({ ...reviewForm, emotionalRegulation: Number(e.target.value) })}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Qualitative Remarks & Observations *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Share specific observations about student's participation, joy, and learning progress..."
                value={reviewForm.comments}
                onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Home Learning Recommendation (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Practice holding jumbo crayons with tripod grip"
                value={reviewForm.recommendations}
                onChange={(e) => setReviewForm({ ...reviewForm, recommendations: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition-all flex items-center gap-2"
            >
              <Star size={18} />
              <span>Publish Review To Parent Portal</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Notices */}
      {activeTab === 'NOTICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Publish Class Notice or Homework</h2>
              <p className="text-xs text-slate-500">
                Broadcast an announcement directly to the parents of LKG Butterflies.
              </p>
            </div>
            {noticeSaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Broadcast Dispatched!
              </span>
            )}
          </div>

          <form onSubmit={handlePostNotice} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={noticeForm.category}
                onChange={(e) => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="Homework">Homework / Weekend Activity</option>
                <option value="Event">Class Celebration / Event</option>
                <option value="Circular">General Class Circular</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bring a Family Photo for Show & Tell"
                value={noticeForm.title}
                onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Content / Instructions *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Instructions for parents and students..."
                value={noticeForm.content}
                onChange={(e) => setNoticeForm({ ...noticeForm, content: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition-all flex items-center gap-2"
            >
              <Send size={18} />
              <span>Broadcast to LKG Parents</span>
            </button>
          </form>
        </div>
      )}

      {/* Teacher Update Student Photo Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-sky-100 relative animate-scaleUp space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Update Student Photo</h3>
                  <p className="text-xs text-slate-500">{editingStudent.name} • {editingStudent.admissionNo}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <PhotoUploadDropzone
                currentPhoto={editingStudent.photo}
                onPhotoChange={handleSaveStudentPhoto}
                targetRole="STUDENT"
                label="Student Photo"
                subtitle="Upload new photo of student or pick a preschool preset."
                size="md"
              />

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
