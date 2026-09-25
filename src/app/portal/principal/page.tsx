'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, DollarSign, TrendingUp, Download, 
  Search, CheckCircle2, AlertTriangle, Eye, Send,
  Calendar, BookOpen, GraduationCap, Settings, Plus, X, Phone, Mail, Award, Clock
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { SchoolSettings, Student, FeeInvoice, SchoolLevel, FeeStatus, FeeReceipt, AdmissionEnquiry, Notice } from '@/types';

export default function PrincipalPortalPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'FINANCIAL_ANALYSIS' | 'FEE_LEDGER' | 'OVERSIGHT'>('FINANCIAL_ANALYSIS');

  // Filters for Fee Ledger
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<SchoolLevel | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<FeeStatus | 'ALL'>('ALL');

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  
  // Payment recording form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CASH' | 'CARD' | 'NETBANKING'>('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const loadData = () => {
    const store = getStore();
    setSettings(store.settings);
    setStudents(store.students || []);
    setInvoices(store.invoices || []);
    setEnquiries(store.enquiries || []);
    setNotices(store.notices || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('preschool_store_updated', loadData);
    return () => window.removeEventListener('preschool_store_updated', loadData);
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  if (!settings) return null;

  // Active students
  const activeStudents = students.filter(s => s.status === 'ACTIVE' || !s.status);
  const totalStudentsCount = activeStudents.length;

  // Financial aggregates
  const totalExpectedTuition = invoices.reduce((acc, curr) => acc + curr.totalAnnualFee, 0);
  const totalRevenue = invoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDues = invoices.reduce((acc, curr) => acc + curr.dueAmount, 0);
  const recoveryRate = totalExpectedTuition > 0 ? Math.round((totalRevenue / totalExpectedTuition) * 100) : 100;
  
  const overdueCount = invoices.filter(inv => inv.status === 'OVERDUE' || (inv.dueAmount > 0 && inv.status !== 'PAID')).length;
  const fullyPaidCount = invoices.filter(inv => inv.status === 'PAID' || inv.dueAmount === 0).length;

  // Class-level breakdowns
  const classBreakdown = (['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'] as SchoolLevel[]).map(lvl => {
    const classStudents = activeStudents.filter(s => s.level === lvl);
    const classStudentIds = new Set(classStudents.map(s => s.id));
    const classInvoices = invoices.filter(inv => classStudentIds.has(inv.studentId));

    const standardFee = settings.fees?.[lvl] || 20000;
    const expected = classInvoices.reduce((acc, curr) => acc + curr.totalAnnualFee, 0) || (classStudents.length * standardFee);
    const collected = classInvoices.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const due = classInvoices.reduce((acc, curr) => acc + curr.dueAmount, 0);
    const pct = expected > 0 ? Math.round((collected / expected) * 100) : 100;

    const readableName = {
      PLAY_SCHOOL: 'Play School (1.5 – 2.5 yrs)',
      NURSERY: 'Nursery (2.5 – 3.5 yrs)',
      LKG: 'LKG (3.5 – 4.5 yrs)',
      UKG: 'UKG (4.5 – 5.5 yrs)'
    }[lvl];

    return {
      level: lvl,
      name: readableName,
      enrolled: classStudents.length,
      feeRate: standardFee,
      expected,
      collected,
      due,
      recoveryRate: pct
    };
  });

  // Filtered invoices for Tab 2
  const filteredInvoices = invoices.filter(inv => {
    const student = students.find(s => s.id === inv.studentId);
    if (!student) return false;

    const matchesSearch = !searchQuery.trim() || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      student.parentName.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesLevel = levelFilter === 'ALL' || student.level === levelFilter;
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;

    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Handle Recording an Offline Fee Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amt = Number(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    if (amt > selectedInvoice.dueAmount) {
      alert(`Amount exceeds current due balance of ₹${selectedInvoice.dueAmount.toLocaleString()}.`);
      return;
    }

    const receiptNo = `REC-LK-${Date.now().toString().slice(-6)}`;
    const newReceipt: FeeReceipt = {
      id: `rec-${Date.now()}`,
      receiptNo,
      date: new Date().toISOString().split('T')[0],
      amount: amt,
      paymentMethod,
      transactionId: transactionRef.trim() || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      description: paymentNotes.trim() || `Tuition fee payment received by Principal Office`
    };

    const newPaid = selectedInvoice.paidAmount + amt;
    const newDue = Math.max(0, selectedInvoice.totalAnnualFee - newPaid);
    const newStatus: FeeStatus = newDue === 0 ? 'PAID' : 'PENDING';

    const updatedInvoices = invoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          paidAmount: newPaid,
          dueAmount: newDue,
          status: newStatus,
          receipts: [...(inv.receipts || []), newReceipt]
        };
      }
      return inv;
    });

    saveStore({ invoices: updatedInvoices });
    setInvoices(updatedInvoices);
    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    setPaymentAmount(0);
    setTransactionRef('');
    setPaymentNotes('');

    showToast(`Payment of ₹${amt.toLocaleString()} recorded successfully with Receipt #${receiptNo}!`);
  };

  // Handle Triggering Fee Reminder
  const handleSendReminder = (inv: FeeInvoice) => {
    const student = students.find(s => s.id === inv.studentId);
    showToast(`SMS & WhatsApp fee dues reminder dispatched to ${student?.parentName || 'Parent'} (${student?.parentPhone || '+91 90436 33545'})!`, 'info');
    setReminderModalOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-600 text-white border-emerald-700 shadow-emerald-200' 
            : 'bg-blue-600 text-white border-blue-700 shadow-blue-200'
        }`}>
          <CheckCircle2 size={18} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Principal Executive Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-100 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 font-black text-[10px] uppercase tracking-wider">
              Institutional Head &amp; Principal
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px]">
              Academic Year {settings.academicYear}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Active Term 1
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Principal Executive &amp; Financial Analysis Console</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Institutional Head: <strong>Dr. R. Arumugam (Principal)</strong> • {settings.schoolName}
          </p>
        </div>

        {/* Executive Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/portal/owner"
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-extrabold text-xs flex items-center gap-1.5 border border-purple-200 transition-colors"
            title="View Owner Financial Audit"
          >
            <TrendingUp size={14} className="text-purple-600" />
            <span>Owner Audit</span>
          </Link>

          <Link
            href="/portal/admin"
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center gap-1.5 border border-amber-200 transition-colors"
            title="View Campus Operations"
          >
            <Settings size={14} className="text-amber-600" />
            <span>Campus Ops</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-200 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Executive Financial & Fee Analysis KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Expected Tuition */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Expected Fee</span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600">📊</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{totalExpectedTuition.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">All active student enrolments</p>
        </div>

        {/* Revenue Collected */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-emerald-600">Total Collected</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
              {recoveryRate}%
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            ₹{totalRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">Realized fee collections</p>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-5 rounded-3xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-rose-600">Outstanding Dues</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
              {overdueCount} Accounts
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">
            ₹{totalDues.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-medium">Unsettled student balances</p>
        </div>

        {/* Student Enrolment Strength */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Total Enrolled</span>
            <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">🎓</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800">{totalStudentsCount}</p>
          <p className="text-[11px] text-emerald-600 font-bold">100% active institutional status</p>
        </div>

        {/* Full Settlements */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Fully Settled</span>
            <span className="p-1 rounded-lg bg-teal-50 text-teal-600">✓</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-teal-700">{fullyPaidCount}</p>
          <p className="text-[11px] text-slate-500 font-medium">{Math.round((fullyPaidCount / (invoices.length || 1)) * 100)}% accounts cleared</p>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('FINANCIAL_ANALYSIS')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'FINANCIAL_ANALYSIS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <TrendingUp size={16} />
          <span>Fee &amp; Financial Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('FEE_LEDGER')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'FEE_LEDGER'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <DollarSign size={16} />
          <span>Student Fee Ledger &amp; Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OVERSIGHT')}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
            activeTab === 'OVERSIGHT'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <GraduationCap size={16} />
          <span>Academic &amp; Campus Oversight</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: FINANCIAL & FEE ANALYTICS
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'FINANCIAL_ANALYSIS' && (
        <div className="space-y-6">
          {/* Class-by-Class Fee Collection Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Class-Level Fee Collection &amp; Recovery Analysis
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed tuition revenue performance across all four preschool programs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Overall Recovery:</span>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200">
                  {recoveryRate}% Collected
                </span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Program Level</th>
                    <th className="py-3.5 px-4">Enrolment</th>
                    <th className="py-3.5 px-4">Fee Rate / Child</th>
                    <th className="py-3.5 px-4">Expected Annual</th>
                    <th className="py-3.5 px-4">Collected</th>
                    <th className="py-3.5 px-4">Outstanding Due</th>
                    <th className="py-3.5 px-4">Collection Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {classBreakdown.map(cb => (
                    <tr key={cb.level} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {cb.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{cb.level}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-800">{cb.enrolled}</span>
                        <span className="text-slate-400 text-[10px] block">Students</span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-600">
                        ₹{cb.feeRate.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono font-extrabold text-slate-800">
                        ₹{cb.expected.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono font-black text-emerald-600">
                        ₹{cb.collected.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono font-black text-rose-600">
                        ₹{cb.due.toLocaleString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className={cb.recoveryRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}>
                              {cb.recoveryRate}%
                            </span>
                            <span className="text-slate-400 text-[9px]">Target 100%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                cb.recoveryRate >= 80 ? 'bg-emerald-500' : cb.recoveryRate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(100, cb.recoveryRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Summary Row */}
                  <tr className="bg-slate-50/90 font-black text-slate-900 border-t-2 border-slate-300">
                    <td className="py-4 px-4 font-black">Institutional Total</td>
                    <td className="py-4 px-4 font-black">{totalStudentsCount}</td>
                    <td className="py-4 px-4 font-mono text-slate-500">—</td>
                    <td className="py-4 px-4 font-mono font-black text-slate-900">₹{totalExpectedTuition.toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono font-black text-emerald-600">₹{totalRevenue.toLocaleString()}</td>
                    <td className="py-4 px-4 font-mono font-black text-rose-600">₹{totalDues.toLocaleString()}</td>
                    <td className="py-4 px-4 font-black text-emerald-700">{recoveryRate}% Complete</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Velocity & Institutional Insights Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Status Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900">
                Payment Status Breakdown
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Fully Settled
                    </span>
                    <span className="font-mono text-slate-700">{fullyPaidCount} of {invoices.length}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${(fullyPaidCount / (invoices.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial / Pending Dues
                    </span>
                    <span className="font-mono text-slate-700">
                      {invoices.filter(i => i.status === 'PENDING').length} of {invoices.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${(invoices.filter(i => i.status === 'PENDING').length / (invoices.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Overdue Dues
                    </span>
                    <span className="font-mono text-slate-700">
                      {invoices.filter(i => i.status === 'OVERDUE').length} of {invoices.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full rounded-full" 
                      style={{ width: `${(invoices.filter(i => i.status === 'OVERDUE').length / (invoices.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                Automatic overdue notifications sent to parents past the 30-day grace window.
              </div>
            </div>

            {/* Principal Financial Health Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-blue-600" />
                <span>Executive Fiscal Health</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                  <span className="font-bold text-blue-900">Tuition Collection Health</span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-200 text-blue-900 font-black text-[10px]">Optimal (A+)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Faculty-to-Child Ratio</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-black text-[10px]">1:8 Maintained</span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                  <span className="font-bold text-amber-900">Upcoming Installment Window</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-black text-[10px]">Next 15 Days</span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Principal */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-[9px] uppercase tracking-wider inline-block mb-2">
                  Institutional Control
                </span>
                <h3 className="font-black text-lg text-white">Principal Direct Actions</h3>
                <p className="text-xs text-blue-100/80 mt-1">
                  Issue automated reminders to all defaulters or generate signed financial audit certificates.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    showToast(`Broadcast reminder queued for all ${overdueCount} pending accounts.`, 'info');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send size={14} />
                  <span>Notify All Defaulters ({overdueCount})</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Print Institutional Audit Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: STUDENT FEE LEDGER & INVOICES
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'FEE_LEDGER' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Institutional Fee Ledger &amp; Student Invoices
              </h2>
              <p className="text-xs text-slate-500">
                Real-time tracking of tuition dues, receipts, payment logging, and direct SMS/WhatsApp reminders.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Export Ledger PDF</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search student, parent, admission #..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span>Class:</span>
                <select
                  value={levelFilter}
                  onChange={e => setLevelFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="ALL">All Classes</option>
                  <option value="PLAY_SCHOOL">Play School</option>
                  <option value="NURSERY">Nursery</option>
                  <option value="LKG">LKG</option>
                  <option value="UKG">UKG</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span>Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PAID">Fully Paid</option>
                  <option value="PENDING">Pending Dues</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-black text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Student &amp; Parent</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Total Annual Fee</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Due Balance</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Principal Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      No invoices match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(inv => {
                    const studentObj = students.find(s => s.id === inv.studentId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{studentObj?.name || 'Student'}</div>
                          <div className="text-[11px] text-slate-500">
                            Parent: {studentObj?.parentName || 'Parent'} ({studentObj?.parentPhone || 'Phone'})
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{inv.invoiceNo}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                            {studentObj?.level || 'Preschool'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          ₹{inv.totalAnnualFee.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                          ₹{inv.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-rose-600">
                          ₹{inv.dueAmount.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {inv.dueDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Receipt Button */}
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setReceiptModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                              title="View Official Receipt"
                            >
                              <Eye size={12} className="inline mr-1" />
                              Receipt
                            </button>

                            {/* Record Offline Payment Button */}
                            {inv.dueAmount > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setPaymentAmount(inv.dueAmount);
                                  setPaymentModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition-colors"
                                title="Record offline fee collection"
                              >
                                Collect Fee
                              </button>
                            )}

                            {/* Reminder Button */}
                            {inv.dueAmount > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setReminderModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-[11px] transition-colors"
                                title="Send SMS/WhatsApp Due Notice"
                              >
                                <Send size={11} className="inline mr-1" />
                                Remind
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
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: ACADEMIC & CAMPUS OVERSIGHT
      ─────────────────────────────────────────────────────────────── */}
      {activeTab === 'OVERSIGHT' && (
        <div className="space-y-6">
          {/* Institutional Capacity & Enrolments */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <h2 className="text-xl font-black text-slate-900">
              Preschool Academic &amp; Institutional Oversight
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {classBreakdown.map(cb => (
                <div key={cb.level} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-black uppercase text-blue-700 block">{cb.level}</span>
                  <p className="font-extrabold text-sm text-slate-900">{cb.name}</p>
                  <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">Strength:</span>
                    <span className="font-black text-slate-900">{cb.enrolled} Enrolled</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500 font-medium">Faculty Ratio:</span>
                    <span className="font-bold text-emerald-700">1 : {Math.max(4, Math.round(cb.enrolled / 2))}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admission Enquiries Pipeline & Circulars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admissions Pipeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-base text-slate-900">Admissions Pipeline</h3>
                <span className="text-xs font-bold text-slate-500">{enquiries.length} Enquiries</span>
              </div>
              <div className="space-y-2 text-xs">
                {enquiries.slice(0, 4).map(enq => (
                  <div key={enq.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{enq.childName} ({enq.targetLevel})</p>
                      <p className="text-[11px] text-slate-500">Parent: {enq.parentName} • {enq.phone}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      enq.status === 'NEW' ? 'bg-orange-100 text-orange-800' :
                      enq.status === 'CONTACTED' ? 'bg-sky-100 text-sky-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {enq.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Circulars Oversight */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-base text-slate-900">Official Notices &amp; Circulars</h3>
                <span className="text-xs font-bold text-slate-500">{notices.length} Published</span>
              </div>
              <div className="space-y-2 text-xs">
                {notices.slice(0, 4).map(not => (
                  <div key={not.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">{not.title}</span>
                      <span className="text-[10px] text-slate-400">{not.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{not.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: VIEW OFFICIAL FEE RECEIPT
      ─────────────────────────────────────────────────────────────── */}
      {receiptModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-blue-100 relative animate-scaleUp space-y-5">
            <button
              onClick={() => {
                setReceiptModalOpen(false);
                setSelectedInvoice(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1 border-b border-slate-200 pb-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-xl">
                🎓
              </div>
              <h3 className="font-black text-lg text-slate-900 leading-tight">
                London Kids Preschool Avalurpet
              </h3>
              <p className="text-xs text-slate-500">Official Institutional Fee Receipt</p>
              <p className="text-[11px] font-mono font-bold text-blue-700">Invoice Ref: {selectedInvoice.invoiceNo}</p>
            </div>

            {/* Student & Fee Summary */}
            {(() => {
              const st = students.find(s => s.id === selectedInvoice.studentId);
              return (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                      <span className="font-black text-slate-900 text-sm">{st?.name || 'Student'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Level</span>
                      <span className="font-bold text-slate-800">{st?.level || 'Nursery'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Admission No</span>
                      <span className="font-mono text-slate-800 font-bold">{st?.admissionNo || 'LK-2026'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Parent / Guardian</span>
                      <span className="font-bold text-slate-800">{st?.parentName || 'Parent'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Tuition Fee:</span>
                      <span className="font-mono font-bold text-slate-900">₹{selectedInvoice.totalAnnualFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-bold">Total Amount Paid:</span>
                      <span className="font-mono font-black text-emerald-700">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-2">
                      <span className="text-rose-600 font-bold">Remaining Due Balance:</span>
                      <span className="font-mono font-black text-rose-600">₹{selectedInvoice.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Payment History / Receipts */}
                  {selectedInvoice.receipts && selectedInvoice.receipts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                        Payment Receipts Audit
                      </span>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {selectedInvoice.receipts.map(r => (
                          <div key={r.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                            <div>
                              <span className="font-bold text-slate-800">{r.receiptNo}</span>
                              <span className="text-slate-400 block text-[9px]">{r.date} • {r.paymentMethod}</span>
                            </div>
                            <span className="font-mono font-black text-emerald-600">+₹{r.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Principal Stamp */}
                  <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100">
                    <div>
                      <span>Authorized Signatory:</span>
                      <p className="font-bold text-slate-800">Dr. R. Arumugam (Principal)</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-black">
                        ✓ VERIFIED AUDIT SEAL
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={() => {
                  setReceiptModalOpen(false);
                  setSelectedInvoice(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: RECORD OFFLINE FEE COLLECTION
      ─────────────────────────────────────────────────────────────── */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-100 relative animate-scaleUp space-y-4">
            <button
              onClick={() => {
                setPaymentModalOpen(false);
                setSelectedInvoice(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase tracking-wider">
                Fee Collection Counter
              </span>
              <h3 className="font-black text-xl text-slate-900 mt-1">
                Record Fee Payment
              </h3>
              <p className="text-xs text-slate-500">
                Log offline cash, cheque, UPI, or card payment from parent.
              </p>
            </div>

            {(() => {
              const st = students.find(s => s.id === selectedInvoice.studentId);
              return (
                <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Student</span>
                    <span className="font-black text-slate-900">{st?.name} ({st?.level})</span>
                    <span className="block text-[11px] text-rose-600 font-bold mt-1">
                      Current Due: ₹{selectedInvoice.dueAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedInvoice.dueAmount}
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Payment Mode *
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="CASH">Cash at Campus Counter</option>
                      <option value="CARD">Debit / Credit Card</option>
                      <option value="NETBANKING">Net Banking / Direct Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Reference / Transaction ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UPI-2026-992144 or Cash Receipt"
                      value={transactionRef}
                      onChange={e => setTransactionRef(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>Confirm &amp; Issue Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentModalOpen(false);
                        setSelectedInvoice(null);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: SEND FEE REMINDER MODAL
      ─────────────────────────────────────────────────────────────── */}
      {reminderModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-orange-100 relative animate-scaleUp space-y-4">
            <button
              onClick={() => {
                setReminderModalOpen(false);
                setSelectedInvoice(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-black text-[9px] uppercase tracking-wider">
                SMS &amp; WhatsApp Reminder
              </span>
              <h3 className="font-black text-xl text-slate-900 mt-1">
                Dispatch Fee Due Notice
              </h3>
              <p className="text-xs text-slate-500">
                Send official notification to parent with due balance details.
              </p>
            </div>

            {(() => {
              const st = students.find(s => s.id === selectedInvoice.studentId);
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-1">
                    <p className="font-bold text-slate-900">To: {st?.parentName} ({st?.parentPhone})</p>
                    <p className="text-slate-600">Child: {st?.name} ({st?.level})</p>
                    <p className="font-black text-rose-600">Outstanding Balance: ₹{selectedInvoice.dueAmount.toLocaleString()}</p>
                    <p className="text-slate-500 text-[11px]">Due Date: {selectedInvoice.dueDate}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 leading-relaxed">
                    &ldquo;Dear {st?.parentName || 'Parent'}, this is a reminder from London Kids Preschool Avalurpet regarding outstanding tuition fee of ₹{selectedInvoice.dueAmount.toLocaleString()} for {st?.name}. Please clear before {selectedInvoice.dueDate}. Contact Principal Office: +91 90436 33545.&rdquo;
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => handleSendReminder(selectedInvoice)}
                      className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>Send Instant Reminder</span>
                    </button>
                    <button
                      onClick={() => {
                        setReminderModalOpen(false);
                        setSelectedInvoice(null);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
