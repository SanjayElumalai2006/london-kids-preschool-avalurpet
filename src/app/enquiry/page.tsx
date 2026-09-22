'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolLogo from '@/components/SchoolLogo';
import { CheckCircle2, ArrowRight, MessageCircle } from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { SchoolLevel } from '@/types';
import { SCHOOL_NAME, SCHOOL_PHONE } from '@/lib/brand';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';
import TurnstileCaptcha from '@/components/TurnstileCaptcha';

const PROGRAMS: { value: SchoolLevel; label: string; emoji: string; age: string; color: string }[] = [
  { value: 'PLAY_SCHOOL', label: 'Play School', emoji: '🧸', age: '1.5 – 2.5 yrs', color: 'border-yellow-400 bg-yellow-50 text-yellow-800' },
  { value: 'NURSERY',     label: 'Nursery',     emoji: '🌱', age: '2.5 – 3.5 yrs', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
  { value: 'LKG',         label: 'LKG',         emoji: '🔤', age: '3.5 – 4.5 yrs', color: 'border-sky-400 bg-sky-50 text-sky-800' },
  { value: 'UKG',         label: 'UKG',         emoji: '🎓', age: '4.5 – 6 yrs',   color: 'border-rose-400 bg-rose-50 text-rose-800' },
];

export default function EnquiryPage() {
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>('PLAY_SCHOOL');
  const [form, setForm] = useState({
    parentName: '',
    phone: '',
    email: '',
    childName: '',
    childAge: '',
    message: '',
  });
  const [consentWhatsApp, setConsentWhatsApp] = useState(true);
  const [captchaToken, setCaptchaToken] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.parentName.trim()) {
      errors.parentName = 'Parent name is required.';
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile phone number.';
    }
    if (!form.email.trim()) {
      errors.email = 'Personal email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid personal email (e.g. name@gmail.com).';
    }
    if (!form.childName.trim()) {
      errors.childName = "Child's name is required.";
    }
    if (!form.childAge.trim()) {
      errors.childAge = "Child's age is required.";
    }
    if (!captchaToken) {
      errors.captcha = 'Please complete the Cloudflare Turnstile verification challenge below.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const enquiryPayload = {
      id: `enq-${Date.now()}`,
      parentName: form.parentName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      childName: form.childName.trim(),
      childAge: form.childAge.trim(),
      targetLevel: selectedLevel,
      message: form.message.trim() || `Admission enquiry for ${selectedLevel}`,
      submittedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'NEW' as const,
    };

    setTimeout(() => {
      const store = getStore();
      saveStore({
        enquiries: [enquiryPayload, ...store.enquiries],
      });

      setSubmittedData(enquiryPayload);
      setLoading(false);
      setSent(true);

      // Open WhatsApp only after successful save and user consent
      if (consentWhatsApp) {
        const waUrl = getWhatsAppEnquiryUrl({
          parentName: enquiryPayload.parentName,
          childName: enquiryPayload.childName,
          childAge: enquiryPayload.childAge,
          program: enquiryPayload.targetLevel,
          phone: enquiryPayload.phone
        });
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      }
    }, 600);
  };

  const directWhatsAppUrl = getWhatsAppEnquiryUrl({
    parentName: form.parentName || undefined,
    childName: form.childName || undefined,
    childAge: form.childAge || undefined,
    program: selectedLevel,
    phone: form.phone || undefined
  });

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-red-50 via-white to-amber-50 text-slate-800">
      <Navbar />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 space-y-3">
            <div className="flex justify-center">
              <SchoolLogo size={60} variant="primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Apply for Admission
            </h1>
            <p className="text-slate-600 text-sm font-semibold">
              {SCHOOL_NAME} — Academic Year 2026-27
            </p>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Fill in your child&apos;s details to submit an enquiry or click below to chat with our Avalurpet admissions desk on WhatsApp.
            </p>

            {/* Direct WhatsApp Action Button */}
            <div className="pt-2 flex justify-center">
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-200 transition-all hover:scale-103"
              >
                <MessageCircle size={16} />
                <span>Enquire Directly on WhatsApp</span>
              </a>
            </div>
          </div>

          {sent && submittedData ? (
            /* ── Success State ─────────────────────────────── */
            <div className="bg-white rounded-3xl shadow-xl border border-emerald-200 p-8 sm:p-10 text-center space-y-5 animate-scaleUp">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 size={44} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Admission Enquiry Saved! 🎉</h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                Thank you for applying to <strong>{SCHOOL_NAME}</strong>. Your enquiry for <strong>{submittedData.childName}</strong> has been received by our administration team. We will contact you at <strong>{submittedData.phone}</strong> and <strong>{submittedData.email}</strong>.
              </p>

              {/* Message Format Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left font-mono text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 font-sans mb-1 text-[11px] uppercase tracking-wider text-slate-500">
                  Enquiry Message Dispatched:
                </p>
                <p className="text-slate-600">Parent Name: <strong>{submittedData.parentName}</strong></p>
                <p className="text-slate-600">Child Name: <strong>{submittedData.childName}</strong> (Age: {submittedData.childAge})</p>
                <p className="text-slate-600">Interested Program: <strong>{submittedData.targetLevel}</strong></p>
                <p className="text-slate-600">Contact Mobile: <strong>{submittedData.phone}</strong></p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <a
                  href={getWhatsAppEnquiryUrl({
                    parentName: submittedData.parentName,
                    childName: submittedData.childName,
                    childAge: submittedData.childAge,
                    program: submittedData.targetLevel,
                    phone: submittedData.phone
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
                >
                  <MessageCircle size={18} />
                  <span>Open WhatsApp Conversation</span>
                </a>
                <Link
                  href="/"
                  className="px-6 py-3.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

              {/* Programme selector */}
              <div className="p-6 sm:p-7 border-b border-slate-100">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
                  Step 1 — Select a Programme <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROGRAMS.map(({ value, label, emoji, age, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedLevel(value)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer ${
                        selectedLevel === value
                          ? `${color} scale-102 shadow-sm ring-2 ring-orange-300`
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="font-extrabold text-xs">{label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{age}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form fields */}
              <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
                  Step 2 — Child &amp; Parent Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      name="parentName"
                      required
                      value={form.parentName}
                      onChange={handleChange}
                      placeholder="e.g. Priya Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        fieldErrors.parentName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.parentName && (
                      <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.parentName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (WhatsApp Enabled) *
                    </label>
                    <input
                      name="phone"
                      required
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 90436 33545"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        fieldErrors.phone ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personal Email Address *
                  </label>
                  <input
                    name="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. priya.parent@gmail.com"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  {fieldErrors.email && (
                    <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.email}</span>
                  )}
                  <span className="text-[10px] text-slate-400 mt-1 block">Used for parent portal login and progress alerts</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Child&apos;s Full Name *
                    </label>
                    <input
                      name="childName"
                      required
                      value={form.childName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        fieldErrors.childName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.childName && (
                      <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.childName}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Child&apos;s Age *
                    </label>
                    <input
                      name="childAge"
                      required
                      value={form.childAge}
                      onChange={handleChange}
                      placeholder="e.g. 3.5 years"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        fieldErrors.childAge ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                      }`}
                    />
                    {fieldErrors.childAge && (
                      <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.childAge}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Special Query or Transport / Daycare Requirement (Optional)
                  </label>
                  <textarea
                    name="message"
                    rows={2}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Ask about school van pickup, meal options, daycare timings..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>

                {/* Cloudflare Turnstile CAPTCHA */}
                <div className="pt-2">
                  <TurnstileCaptcha
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setFieldErrors(prev => {
                        const next = { ...prev };
                        delete next.captcha;
                        return next;
                      });
                    }}
                    onExpire={() => setCaptchaToken('')}
                    onError={(err) => console.warn('Turnstile error:', err)}
                  />
                  {fieldErrors.captcha && (
                    <span className="text-[11px] text-rose-600 font-bold mt-1 block">{fieldErrors.captcha}</span>
                  )}
                </div>

                {/* WhatsApp User Consent Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-xs text-slate-700 font-medium cursor-pointer bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={consentWhatsApp}
                      onChange={e => setConsentWhatsApp(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Open WhatsApp upon submission:</strong> Also open WhatsApp in a new tab with my pre-filled enquiry details to chat directly with admissions.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-300/50 transition-all hover:scale-102 active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>Saving Enquiry...</span>
                    ) : (
                      <>
                        <span>Submit Admission Enquiry</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-[11px] text-slate-500">
                  Prefer to call directly? Ring us at <strong>{SCHOOL_PHONE}</strong> (8:30 AM - 1:30 PM).
                </p>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
