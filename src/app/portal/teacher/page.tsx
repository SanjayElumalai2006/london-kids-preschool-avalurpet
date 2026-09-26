'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle2, AlertTriangle, 
  Camera, Star, BookOpen, Send, Plus, Sparkles 
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { Student, AttendanceStatus, ActivityPost, TeacherReview, StudentResult, Notice, EventPhoto, SchoolLevel, User } from '@/types';
import { processImageFile } from '@/lib/imageUpload';
import PhotoUploadDropzone from '@/components/PhotoUploadDropzone';

export default function TeacherPortalPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel | 'ALL'>('LKG');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
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
  const [showOnPublicWebsite, setShowOnPublicWebsite] = useState(true);
  const [isOptimizingPhoto, setIsOptimizingPhoto] = useState(false);
  const activityFileInputRef = React.useRef<HTMLInputElement>(null);

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
    const user = store.currentUser;
    setCurrentUser(user);

    const active = store.students.filter(s => s.status === 'ACTIVE' || !s.status);
    setAllStudents(active);

    const initialLvl: SchoolLevel | 'ALL' = user?.assignedClass || selectedLevel || 'LKG';
    setSelectedLevel(initialLvl);

    const filtered = active.filter(s => initialLvl === 'ALL' || s.level === initialLvl);
    setClassStudents(filtered);

    if (filtered.length > 0) {
      setReviewStudentId(prev => (prev && filtered.some(s => s.id === prev)) ? prev : filtered[0].id);
    }

    // Default all to PRESENT if not marked yet
    const initialMap: Record<string, AttendanceStatus> = {};
    filtered.forEach(s => {
      initialMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(initialMap);
  };

  const handleLevelChange = (lvl: SchoolLevel | 'ALL') => {
    setSelectedLevel(lvl);
    const store = getStore();
    const active = store.students.filter(s => s.status === 'ACTIVE' || !s.status);
    const filtered = active.filter(s => lvl === 'ALL' || s.level === lvl);
    setClassStudents(filtered);

    if (filtered.length > 0) {
      setReviewStudentId(filtered[0].id);
    }

    const initialMap: Record<string, AttendanceStatus> = {};
    filtered.forEach(s => {
      initialMap[s.id] = attendanceMap[s.id] || 'PRESENT';
    });
    setAttendanceMap(initialMap);
  };

  const handleSaveStudentPhoto = (newPhoto: string) => {
    if (!editingStudent) return;
    const store = getStore();
    const updated = store.students.map(s => s.id === editingStudent.id ? { ...s, photo: newPhoto, updatedAt: new Date().toISOString() } : s);
    saveStore({ students: updated });
    setClassStudents(updated.filter(s => (s.status === 'ACTIVE' || !s.status) && (selectedLevel === 'ALL' || s.level === selectedLevel)));
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
    const marker = currentUser?.name 
      ? `${currentUser.name} (${currentUser.role === 'STAFF' ? 'Campus Staff' : 'Class Educator'})`
      : 'Class Educator';

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

  const handlePostActivity = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const today = new Date().toISOString().split('T')[0];
    const author = currentUser?.name 
      ? `${currentUser.name} (${currentUser.role === 'STAFF' ? 'Staff' : 'Educator'})`
      : 'Class Educator';
    const targetLevel: SchoolLevel = selectedLevel === 'ALL' ? 'PLAY_SCHOOL' : selectedLevel;

    const newAct: ActivityPost = {
      id: `act-${Date.now()}`,
      level: targetLevel,
      title: newActivity.title,
      description: newActivity.description,
      date: today,
      imageUrl: newActivity.imageUrl,
      category: newActivity.category,
      createdBy: author
    };

    let updatedGallery = store.gallery || [];
    if (showOnPublicWebsite) {
      const catMap: Record<ActivityPost['category'], EventPhoto['category']> = {
        'Arts & Crafts': 'ARTS',
        'Sensory & Play': 'PLAY',
        'Music & Dance': 'EVENTS',
        'Story & Phonics': 'CLASSROOM',
        'Outdoor Fun': 'PLAY',
        'Celebration': 'EVENTS',
      };

      const newPhoto: EventPhoto = {
        id: `gal-${Date.now()}`,
        title: newActivity.title,
        caption: newActivity.description,
        date: today,
        category: catMap[newActivity.category] || 'CLASSROOM',
        imageUrl: newActivity.imageUrl,
        uploadedBy: currentUser?.name || 'Class Educator',
        showOnPublicWebsite: true,
        targetLevel: targetLevel,
        createdAt: new Date().toISOString(),
      };
      updatedGallery = [newPhoto, ...updatedGallery];
    }

    saveStore({
      activities: [newAct, ...store.activities],
      gallery: updatedGallery,
    });

    setActivitySaved(true);
    setNewActivity({
      title: '',
      description: '',
      category: 'Sensory & Play',
      imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80'
    });
    setTimeout(() => setActivitySaved(false), 3500);
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const avgRating = Math.round((reviewForm.socialSkills + reviewForm.fineMotor + reviewForm.languageCommunication + reviewForm.emotionalRegulation) / 4);

    const newRev: TeacherReview = {
      id: `rev-${Date.now()}`,
      studentId: reviewStudentId,
      teacherId: currentUser?.id || 'user-teacher-lk',
      teacherName: currentUser?.name || 'Class Educator',
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
    const author = currentUser?.name 
      ? `${currentUser.name} (${currentUser.role === 'STAFF' ? 'Staff' : 'Educator'})`
      : 'Class Educator';

    const newNot: Notice = {
      id: `not-${Date.now()}`,
      title: noticeForm.title,
      content: noticeForm.content,
      targetLevel: selectedLevel,
      date: new Date().toISOString().split('T')[0],
      authorName: author,
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

  const levelDisplayNames: Record<SchoolLevel | 'ALL', string> = {
    PLAY_SCHOOL: 'Play School (1.5 – 2.5 yrs)',
    NURSERY: 'Nursery (2.5 – 3.5 yrs)',
    LKG: 'LKG (3.5 – 4.5 yrs)',
    UKG: 'UKG (4.5 – 5.5 yrs)',
    ALL: 'All Preschool Classes'
  };

  return (
    <div className="space-y-6">
      {/* Teacher / Staff Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sky-100 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px] uppercase">
              {currentUser?.role === 'STAFF' ? 'Campus Staff & Support' : 'Class Educator Portal'}
            </span>
            {currentUser?.assignedSection && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                Section {currentUser.assignedSection}
              </span>
            )}
            <span className="text-xs text-slate-500 font-bold">Academic Year 2026-27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {levelDisplayNames[selectedLevel]}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Logged in as: <strong>{currentUser?.name || 'Class Educator'}</strong> • Active Enrolled: <strong>{classStudents.length} Students</strong>
          </p>

          {/* Level Switcher Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG', 'ALL'] as (SchoolLevel | 'ALL')[]).map(lvl => (
              <button
                key={lvl}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {lvl === 'ALL' ? 'All Classes' : lvl.replace('_', ' ')}
              </button>
            ))}
          </div>
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
                  Or Paste Photo Web URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newActivity.imageUrl}
                  onChange={(e) => setNewActivity({ ...newActivity, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Activity Photo (Device Upload or Camera) *
              </label>

              {/* Photo Preview & Dropzone */}
              <div className="flex flex-col sm:flex-row gap-4 items-center p-4 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40">
                <div className="w-36 h-28 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs relative">
                  <img
                    src={newActivity.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {isOptimizingPhoto && (
                    <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-xs font-bold">
                      Processing...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <button
                    type="button"
                    onClick={() => activityFileInputRef.current?.click()}
                    disabled={isOptimizingPhoto}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isOptimizingPhoto ? 'Compressing...' : 'Upload Photo from Device / Camera'}
                  </button>

                  <input
                    ref={activityFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsOptimizingPhoto(true);
                      try {
                        const opt = await processImageFile(file, 1200, 0.82);
                        setNewActivity(prev => ({ ...prev, imageUrl: opt }));
                      } catch (err) {
                        alert('Failed to process image');
                      } finally {
                        setIsOptimizingPhoto(false);
                        e.target.value = '';
                      }
                    }}
                  />

                  <p className="text-[11px] text-slate-500">
                    Snap a photo with your mobile or upload JPG/PNG. Auto-compressed for instant loading!
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description &amp; Learning Highlights *
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

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnPublicWebsite}
                  onChange={(e) => setShowOnPublicWebsite(e.target.checked)}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Also feature this photo on the Public Website Gallery (<code>/gallery</code>)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isOptimizingPhoto}
              className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md shadow-sky-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera size={18} />
              <span>Post to Parents&apos; Feed &amp; Gallery</span>
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
