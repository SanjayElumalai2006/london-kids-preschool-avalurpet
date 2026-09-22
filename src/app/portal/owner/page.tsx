'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, DollarSign, Award, TrendingUp, 
  Settings, CheckCircle2, ShieldCheck, Download, 
  BookOpen, Calendar, Sparkles, Plus, Star 
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { SchoolSettings, Student, FeeInvoice, SchoolLevel } from '@/types';

export default function OwnerPortalPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CLASSES' | 'SETTINGS' | 'LOGS'>('OVERVIEW');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const loadData = () => {
    const store = getStore();
    setSettings(store.settings);
    setStudents(store.students);
    setInvoices(store.invoices);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  if (!settings) return null;

  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDues = invoices.reduce((acc, curr) => acc + curr.dueAmount, 0);
  const activeStudents = students.filter(s => s.status === 'ACTIVE' || !s.status);
  const totalStudentsCount = activeStudents.length;
  const recoveryRate = (totalRevenue + totalDues) > 0 ? Math.round((totalRevenue / (totalRevenue + totalDues)) * 100) : 100;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    saveStore({ settings });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Class Level breakdown counts (active students only)
  const playSchoolCount = activeStudents.filter(s => s.level === 'PLAY_SCHOOL').length;
  const nurseryCount = activeStudents.filter(s => s.level === 'NURSERY').length;
  const lkgCount = activeStudents.filter(s => s.level === 'LKG').length;
  const ukgCount = activeStudents.filter(s => s.level === 'UKG').length;

  return (
    <div className="space-y-6">
      {/* Owner Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-100 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase">
              Executive School Oversight
            </span>
            <span className="text-xs text-slate-500 font-bold">Academic Year {settings.academicYear}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Director & Owner Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Managing Director: <strong>Mrs. Lakshmi Priya</strong> • {settings.schoolName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/portal/owner/users"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Users size={15} />
            <span>Manage Users Directory</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download size={15} />
            <span>Export Executive PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</span>
          <p className="text-3xl font-black text-slate-800">{totalStudentsCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold">↑ 18% vs last year</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Fee Revenue Collected</span>
          <p className="text-3xl font-black text-emerald-600">${totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-700 font-medium">88% Recovery Rate</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Pending Fee Dues</span>
          <p className="text-3xl font-black text-rose-600">${totalDues.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">Unsettled student balances</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Teaching Faculty</span>
          <p className="text-3xl font-black text-sky-600">14</p>
          <p className="text-[11px] text-slate-500">Ratio 1:8 maintained</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400">Average Attendance</span>
          <p className="text-3xl font-black text-purple-600">93.4%</p>
          <p className="text-[11px] text-purple-700 font-medium">Campus-wide average</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        {[
          { id: 'OVERVIEW', label: 'Financials & Analytics', icon: '📈' },
          { id: 'CLASSES', label: 'All 4 School Levels', icon: '🏫' },
          { id: 'SETTINGS', label: 'School Settings & Fees', icon: '⚙️' },
          { id: 'LOGS', label: 'System Audit Logs', icon: '🛡️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
              activeTab === tab.id
                ? 'bg-purple-700 text-white shadow-md shadow-purple-200 scale-102'
                : 'bg-white text-slate-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Collection Bar Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Monthly Tuition Revenue</h3>
                <p className="text-xs text-slate-500">Collected amounts over the last 6 months ($)</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                On Track
              </span>
            </div>

            {/* Custom Bar Visualization */}
            <div className="pt-6 space-y-4">
              {[
                { month: 'Apr 2026', amount: 18500, percent: 85, color: 'bg-amber-400' },
                { month: 'May 2026', amount: 14200, percent: 65, color: 'bg-orange-400' },
                { month: 'Jun 2026', amount: 12000, percent: 55, color: 'bg-rose-400' },
                { month: 'Jul 2026', amount: 15800, percent: 72, color: 'bg-emerald-400' },
                { month: 'Aug 2026', amount: 13900, percent: 63, color: 'bg-sky-400' },
                { month: 'Sep 2026', amount: 21200, percent: 95, color: 'bg-purple-500' }
              ].map((m, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{m.month}</span>
                    <span className="font-mono text-slate-900">${m.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div className={`${m.color} h-full rounded-full transition-all duration-700`} style={{ width: `${m.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Distribution & Revenue by Level */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-lg text-slate-800">Student Strength by Level</h3>
            <p className="text-xs text-slate-500">Distribution across the 4 early childhood levels</p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🧸</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Play School</h4>
                    <span className="text-[11px] text-slate-500">Annual Fee: ${settings.fees.PLAY_SCHOOL}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-amber-900">{playSchoolCount} Kids</span>
                  <span className="text-[10px] text-slate-400 block">2 Batches</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">Nursery</h4>
                    <span className="text-[11px] text-slate-500">Annual Fee: ${settings.fees.NURSERY}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-900">{nurseryCount} Kids</span>
                  <span className="text-[10px] text-slate-400 block">2 Batches</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦋</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">LKG (Lower KG)</h4>
                    <span className="text-[11px] text-slate-500">Annual Fee: ${settings.fees.LKG}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-sky-900">{lkgCount} Kids</span>
                  <span className="text-[10px] text-slate-400 block">2 Batches</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🦉</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">UKG (Upper KG)</h4>
                    <span className="text-[11px] text-slate-500">Annual Fee: ${settings.fees.UKG}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-rose-900">{ukgCount} Kids</span>
                  <span className="text-[10px] text-slate-400 block">2 Batches</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Classes */}
      {activeTab === 'CLASSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              level: 'Play School (Little Cubs)',
              age: '1.5 - 2.5 yrs',
              teacher: 'Ms. Sneha Rao',
              count: playSchoolCount,
              timing: '9:00 AM - 11:30 AM',
              highlights: 'Sensory sandbox, rhythm play, motor coordination',
              color: 'border-amber-200 bg-amber-50/30'
            },
            {
              level: 'Nursery (Ducklings)',
              age: '2.5 - 3.5 yrs',
              teacher: 'Mrs. Anita Das',
              count: nurseryCount,
              timing: '8:45 AM - 12:00 PM',
              highlights: 'Letter recognition, finger painting, independence',
              color: 'border-emerald-200 bg-emerald-50/30'
            },
            {
              level: 'LKG (Butterflies)',
              age: '3.5 - 4.5 yrs',
              teacher: 'Ms. Priya Patel',
              count: lkgCount,
              timing: '8:30 AM - 12:30 PM',
              highlights: 'Phonics reading, number counting 1-50, nature study',
              color: 'border-sky-200 bg-sky-50/30'
            },
            {
              level: 'UKG (Wise Owls)',
              age: '4.5 - 6.0 yrs',
              teacher: 'Mrs. Deepa Shah',
              count: ukgCount,
              timing: '8:30 AM - 1:15 PM',
              highlights: 'CVC words, sentence writing, addition math, primary prep',
              color: 'border-rose-200 bg-rose-50/30'
            }
          ].map((c, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border-2 ${c.color} bg-white shadow-xs space-y-4`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Class Level</span>
                  <h3 className="text-xl font-black text-slate-800">{c.level}</h3>
                  <span className="text-xs text-slate-500 font-bold">Age Group: {c.age}</span>
                </div>
                <span className="text-sm font-black bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  {c.count} Students
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Educator:</span>
                  <strong className="text-slate-800">{c.teacher}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Daily Timing:</span>
                  <span className="text-slate-800">{c.timing}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Curriculum Focus:</span>
                  <span className="text-slate-700 max-w-xs text-right font-medium">{c.highlights}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Settings */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 max-w-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-slate-900">Campus Profile & Tuition Fees</h2>
              <p className="text-xs text-slate-500">
                Configure school profile, contact information, and annual fee structure.
              </p>
            </div>
            {settingsSaved && (
              <span className="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 size={16} /> Settings Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">School Name *</label>
                <input
                  type="text"
                  required
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Registration / Accreditation No *</label>
                <input
                  type="text"
                  required
                  value={settings.registrationNo}
                  onChange={(e) => setSettings({ ...settings, registrationNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">School Tagline *</label>
              <input
                type="text"
                required
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Phone *</label>
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Campus Address *</label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            {/* Annual Tuition Fees Configuration */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-900 mb-3">Annual Tuition Fee per Level ($)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Play School</label>
                  <input
                    type="number"
                    value={settings.fees.PLAY_SCHOOL}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, PLAY_SCHOOL: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nursery</label>
                  <input
                    type="number"
                    value={settings.fees.NURSERY}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, NURSERY: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">LKG</label>
                  <input
                    type="number"
                    value={settings.fees.LKG}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, LKG: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">UKG</label>
                  <input
                    type="number"
                    value={settings.fees.UKG}
                    onChange={(e) => setSettings({
                      ...settings,
                      fees: { ...settings.fees, UKG: Number(e.target.value) }
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md shadow-purple-200 transition-colors"
              >
                Save School Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Logs */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xl font-black text-slate-900">System Security & Action Logs</h2>
          <p className="text-xs text-slate-500">
            Immutable audit trail of important operations across admissions, payments, and staff changes.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {[
                  { time: '2026-09-18 13:45', user: 'Neha Sharma (Parent)', action: 'Fee Payment ($1,000 via UPI)', entity: 'INV-2026-0941', status: 'SUCCESS' },
                  { time: '2026-09-18 11:20', user: 'Ms. Priya Patel (Teacher)', action: 'Attendance Submission (18 Marked)', entity: 'Class LKG Butterflies', status: 'SUCCESS' },
                  { time: '2026-09-17 14:30', user: 'Sneha Chawla (Guest)', action: 'Online Admission Enquiry', entity: 'Nursery Level', status: 'PENDING REVIEW' },
                  { time: '2026-09-16 10:15', user: 'Mr. Vikram Malhotra (Admin)', action: 'Dispatched Fee Reminder SMS', entity: '3 Students', status: 'SUCCESS' },
                  { time: '2026-09-15 09:00', user: 'Mrs. Lakshmi Priya (Owner)', action: 'Updated LKG Tuition Schedule', entity: 'Fee Matrix', status: 'SUCCESS' }
                ].map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.time}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{log.user}</td>
                    <td className="py-3 px-4 text-slate-700">{log.action}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{log.entity}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
