'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, CheckCircle2, AlertTriangle, 
  DollarSign, Star, BookOpen, Download, 
  Clock, Award, Camera, FileText, Bell, Sparkles 
} from '@/components/Icons';
import PaymentModal from '@/components/PaymentModal';
import { getStore, saveStore } from '@/lib/store';
import { Student, AttendanceRecord, TeacherReview, ActivityPost, StudentResult, FeeInvoice, Notice } from '@/types';
import PhotoUploadDropzone from '@/components/PhotoUploadDropzone';

export default function ParentPortalPage() {
  const [student, setStudent] = useState<Student | null>(null);
  const [linkedStudents, setLinkedStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reviews, setReviews] = useState<TeacherReview[]>([]);
  const [activities, setActivities] = useState<ActivityPost[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [invoice, setInvoice] = useState<FeeInvoice | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ATTENDANCE' | 'REVIEWS' | 'ACTIVITIES' | 'RESULTS' | 'FEES' | 'NOTICES'>('OVERVIEW');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState('');

  const loadData = () => {
    const store = getStore();
    const currentUser = store.currentUser;
    const linkedIds: string[] = (currentUser?.studentIds && currentUser.studentIds.length > 0)
      ? currentUser.studentIds
      : (currentUser?.studentId ? [currentUser.studentId] : []);

    // Filter only active students
    const activeStudents = store.students.filter(s => s.status === 'ACTIVE' || !s.status);

    // Find linked students for current parent
    let userChildren = activeStudents.filter(s => linkedIds.includes(s.id));
    if (userChildren.length === 0 && activeStudents.length > 0) {
      userChildren = [activeStudents[0]];
    }
    setLinkedStudents(userChildren);

    const activeChild = (student && userChildren.some(c => c.id === student.id))
      ? userChildren.find(c => c.id === student.id)!
      : userChildren[0];

    if (!activeChild) {
      setStudent(null);
      return;
    }
    setStudent(activeChild);

    // Scoped attendance
    setAttendance(store.attendance.filter(a => a.studentId === activeChild.id));
    // Scoped reviews
    setReviews(store.reviews.filter(r => r.studentId === activeChild.id));
    // Scoped activities (for student's class level)
    setActivities(store.activities.filter(a => a.level === activeChild.level));
    // Scoped results
    setResults(store.results.filter(r => r.studentId === activeChild.id));
    // Scoped invoice
    setInvoice(store.invoices.find(i => i.studentId === activeChild.id) || null);
    // Scoped notices
    setNotices(store.notices.filter(n => n.targetLevel === 'ALL' || n.targetLevel === activeChild.level));
  };

  const handleSelectChild = (child: Student) => {
    const store = getStore();
    setStudent(child);
    setAttendance(store.attendance.filter(a => a.studentId === child.id));
    setReviews(store.reviews.filter(r => r.studentId === child.id));
    setActivities(store.activities.filter(a => a.level === child.level));
    setResults(store.results.filter(r => r.studentId === child.id));
    setInvoice(store.invoices.find(i => i.studentId === child.id) || null);
    setNotices(store.notices.filter(n => n.targetLevel === 'ALL' || n.targetLevel === child.level));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  if (!student) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border-2 border-slate-200 text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-xs">
            🎒
          </div>
          <h2 className="text-xl font-black text-slate-800">
            No Student Profile Linked Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Your parent portal is active. Once the preschool office enrolls and links your child to your registered personal email, their live attendance, classroom activities, reviews, and fee invoices will appear here.
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
              School Helpdesk: +91 90436 33545
            </span>
          </div>
        </div>
      </div>
    );
  }

  const handleSavePhoto = () => {
    if (!student || !newPhoto) return;
    const store = getStore();
    const updatedStudents = store.students.map(s => s.id === student.id ? { ...s, photo: newPhoto } : s);
    saveStore({ students: updatedStudents });
    setStudent({ ...student, photo: newPhoto });
    setPhotoModalOpen(false);
  };

  const totalDays = attendance.length || 14;
  const presentDays = attendance.filter(a => a.status === 'PRESENT').length || 12;
  const lateDays = attendance.filter(a => a.status === 'LATE').length || 1;
  const absentDays = attendance.filter(a => a.status === 'ABSENT').length || 1;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  return (
    <div className="space-y-6">
      {/* Child Profile Hero Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-linear-to-l from-emerald-50 via-emerald-50/20 to-transparent pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Child Photo with Upload Trigger */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-lg relative bg-white">
              <img
                src={student.photo}
                alt={student.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => { setNewPhoto(student.photo); setPhotoModalOpen(true); }}
                className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-center p-1"
                title="Click to change or upload child's photo"
              >
                <Camera size={20} className="mb-0.5" />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  Update
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setNewPhoto(student.photo); setPhotoModalOpen(true); }}
              className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Upload child photo"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Child Details */}
          <div className="text-center sm:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {student.name}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                {student.level} • {student.section}
              </span>
            </div>

            {linkedStudents.length > 1 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="text-xs font-bold text-slate-500">Your Children:</span>
                <div className="flex flex-wrap gap-1.5">
                  {linkedStudents.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => handleSelectChild(child)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        student.id === child.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {child.name} ({child.level})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs text-slate-600">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission ID</span>
                <strong className="text-slate-800">{student.admissionNo}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                <strong className="text-slate-800">{student.rollNo}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Class Teacher</span>
                <strong className="text-slate-800">{student.teacherName}</strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                <strong className="text-slate-800">{student.bloodGroup}</strong>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 flex flex-wrap items-center justify-center sm:justify-start gap-4">
              <span>🩺 <strong>Medical Note:</strong> {student.medicalNotes}</span>
              <span>•</span>
              <span>📞 <strong>Emergency:</strong> {student.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Dashboard Overview', icon: '📊' },
          { id: 'ATTENDANCE', label: 'Daily Attendance', icon: '📅' },
          { id: 'REVIEWS', label: 'Teacher Reviews', icon: '⭐' },
          { id: 'ACTIVITIES', label: 'Class Activities', icon: '🎨' },
          { id: 'RESULTS', label: 'Progress & Results', icon: '🏆' },
          { id: 'FEES', label: 'Fees & Payment', icon: '💳' },
          { id: 'NOTICES', label: 'Notices & Homework', icon: '📢' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === tab.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-102'
                : 'bg-white text-slate-700 hover:bg-orange-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase">Attendance</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Calendar size={18} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800">{attendanceRate}%</p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} /> {presentDays} Present • {absentDays} Absent
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase">Fee Balance</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <DollarSign size={18} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800">
                ${invoice?.dueAmount.toLocaleString() || '0'}
              </p>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Due: {invoice?.dueDate}</span>
                {invoice && invoice.dueAmount > 0 && (
                  <button
                    onClick={() => setPayModalOpen(true)}
                    className="text-xs font-bold text-orange-600 hover:underline"
                  >
                    Pay Now →
                  </button>
                )}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase">Teacher Feedback</span>
                <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Star size={18} />
                </span>
              </div>
              <p className="text-3xl font-black text-slate-800">5.0 ★</p>
              <p className="text-[11px] text-sky-700 font-medium">
                &ldquo;Eager learner & social friend&rdquo;
              </p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-bold uppercase">Next School Event</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Bell size={18} />
                </span>
              </div>
              <p className="text-base font-black text-slate-800 truncate">Grandparents Day</p>
              <p className="text-[11px] text-slate-500">Friday, Sept 25th • 10:00 AM</p>
            </div>
          </div>

          {/* Highlights Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Classroom Moments */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Camera size={20} className="text-orange-500" />
                  <span>Recent Activities & Photos</span>
                </h3>
                <button
                  onClick={() => setActiveTab('ACTIVITIES')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  View All ({activities.length})
                </button>
              </div>

              <div className="space-y-3">
                {activities.slice(0, 2).map(act => (
                  <div key={act.id} className="flex gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-md">
                        {act.category}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800">{act.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Teacher Note */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Star size={20} className="text-amber-500" />
                  <span>Teacher&apos;s Latest Evaluation</span>
                </h3>
                <button
                  onClick={() => setActiveTab('REVIEWS')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Full Review
                </button>
              </div>

              {reviews.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-800">{reviews[0].teacherName}</span>
                    <span className="text-xs text-slate-500">{reviews[0].date}</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    &ldquo;{reviews[0].comments}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-amber-200/60 text-xs text-amber-900 font-semibold">
                    💡 Suggestion: {reviews[0].recommendations}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Daily Attendance Log</h2>
              <p className="text-xs text-slate-500">
                Official calendar and marked presence records for Academic Year 2026-27.
              </p>
            </div>
            <div className="flex gap-2 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                Present: {presentDays} days
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800">
                Late: {lateDays} days
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800">
                Absent: {absentDays} days
              </span>
            </div>
          </div>

          {/* Month Log Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Day</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks / Note</th>
                  <th className="py-3 px-4">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {attendance.map((rec) => {
                  const dateObj = new Date(rec.date);
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-800">{rec.date}</td>
                      <td className="py-3 px-4 text-slate-500">{dayName}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                          rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'LATE' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {rec.remarks || 'Normal attendance'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{rec.markedBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'REVIEWS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Teacher Reviews & Observations</h2>
            <p className="text-xs text-slate-500">
              Personalized qualitative feedback and milestone ratings by Class Teacher {student.teacherName}.
            </p>
          </div>

          <div className="space-y-6">
            {reviews.map(rev => (
              <div key={rev.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-800">
                      Monthly Milestone Assessment
                    </h3>
                    <span className="text-xs text-slate-500">Evaluator: {rev.teacherName} • Date: {rev.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.overallRating)].map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">({rev.overallRating}/5)</span>
                  </div>
                </div>

                {/* Rating category bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Social Empathy & Sharing</span>
                      <span className="text-emerald-600">{rev.socialSkills}/5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(rev.socialSkills / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Fine Motor & Scissor Grip</span>
                      <span className="text-amber-600">{rev.fineMotor}/5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(rev.fineMotor / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Language & Phonics Vocab</span>
                      <span className="text-sky-600">{rev.languageCommunication}/5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: `${(rev.languageCommunication / 5) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Emotional Regulation</span>
                      <span className="text-purple-600">{rev.emotionalRegulation}/5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full" style={{ width: `${(rev.emotionalRegulation / 5) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide text-[10px]">
                    Teacher&apos;s Detailed Remarks:
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    &ldquo;{rev.comments}&rdquo;
                  </p>
                  {rev.recommendations && (
                    <p className="text-xs text-orange-700 font-semibold pt-1 border-t border-slate-100">
                      💡 <strong>Home Support Tip:</strong> {rev.recommendations}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Activities */}
      {activeTab === 'ACTIVITIES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Classroom Moments & Activities</h2>
            <p className="text-xs text-slate-500">
              Live updates and photo highlights from {student.level} - {student.section}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activities.map(act => (
              <div key={act.id} className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-50 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="aspect-4/3 relative overflow-hidden">
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-orange-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                      {act.category}
                    </span>
                  </div>
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] text-slate-400 font-bold block">{act.date}</span>
                    <h3 className="font-extrabold text-base text-slate-800">{act.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] text-slate-400 border-t border-slate-200/60 mt-2 flex justify-between items-center">
                  <span>By {act.createdBy}</span>
                  <button className="text-orange-500 font-bold hover:underline">Download Photo</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Results */}
      {activeTab === 'RESULTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Academic Progress & Skill Evaluation</h2>
              <p className="text-xs text-slate-500">
                Official Term Assessment Report Card for {student.name}.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Download size={16} />
              <span>Print Report Card</span>
            </button>
          </div>

          {results.map(res => (
            <div key={res.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[11px] font-bold uppercase text-orange-600">{res.academicYear}</span>
                  <h3 className="text-xl font-black text-slate-800">{res.term} Comprehensive Evaluation</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  Promoted & On Track
                </span>
              </div>

              {/* Skills Score Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700 uppercase">
                    <tr>
                      <th className="py-3 px-4">Developmental Skill / Domain</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {res.skills.map((sk, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-4 font-bold text-slate-800">{sk.skillName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{sk.score}%</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            {sk.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>Director & Class Teacher Note:</strong> {res.teacherRemark}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Fees */}
      {activeTab === 'FEES' && invoice && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">Fee Statement & Receipts</h2>
              <p className="text-xs text-slate-500">
                Invoice No: <strong>{invoice.invoiceNo}</strong> • {invoice.term}
              </p>
            </div>
            {invoice.dueAmount > 0 && (
              <button
                onClick={() => setPayModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <DollarSign size={18} />
                <span>Pay Fee (${invoice.dueAmount.toLocaleString()})</span>
              </button>
            )}
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Annual Fee</span>
              <p className="text-xl font-black text-slate-800">${invoice.totalAnnualFee.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block text-[10px] font-bold uppercase">Amount Paid</span>
              <p className="text-xl font-black text-emerald-800">${invoice.paidAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <span className="text-rose-700 block text-[10px] font-bold uppercase">Balance Due</span>
              <p className="text-xl font-black text-rose-800">${invoice.dueAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-amber-700 block text-[10px] font-bold uppercase">Due Date</span>
              <p className="text-sm font-black text-amber-900 mt-1">{invoice.dueDate}</p>
            </div>
          </div>

          {/* Payment History & Receipts */}
          <div className="space-y-3 pt-4">
            <h3 className="font-extrabold text-base text-slate-800">Official Payment History</h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-3 px-4">Receipt No</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {invoice.receipts.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{rec.receiptNo}</td>
                      <td className="py-3 px-4 text-slate-500">{rec.date}</td>
                      <td className="py-3 px-4 font-extrabold text-emerald-600">${rec.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {rec.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{rec.transactionId}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => window.print()}
                          className="text-orange-600 hover:underline font-bold text-xs flex items-center gap-1"
                        >
                          <Download size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Notices */}
      {activeTab === 'NOTICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Class Notices & Homework</h2>
            <p className="text-xs text-slate-500">
              Official circulars and weekend tasks for {student.level}.
            </p>
          </div>

          <div className="space-y-4">
            {notices.map(n => (
              <div key={n.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    n.category === 'Event' ? 'bg-purple-100 text-purple-800' :
                    n.category === 'Homework' ? 'bg-amber-100 text-amber-800' :
                    'bg-sky-100 text-sky-800'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{n.date}</span>
                </div>
                <h3 className="font-extrabold text-base text-slate-800">{n.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  Published by: <strong>{n.authorName}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {invoice && (
        <PaymentModal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          invoice={invoice}
          studentName={student.name}
        />
      )}

      {/* Upload / Change Child Photo Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-100 relative animate-scaleUp space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">Child Profile Photo</h3>
                  <p className="text-xs text-slate-500">{student.name} ({student.level})</p>
                </div>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <PhotoUploadDropzone
                currentPhoto={newPhoto}
                onPhotoChange={setNewPhoto}
                targetRole="STUDENT"
                label="Upload Child's Photo"
                subtitle="Select a photo from your phone or device camera, or choose a preset."
                size="md"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-200 cursor-pointer"
                >
                  Save Child Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
