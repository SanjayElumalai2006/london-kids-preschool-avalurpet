'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageCircle, AlertCircle, Calendar } from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { SchoolLevel } from '@/types';
import {
  SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_CITY,
  SCHOOL_PHONE, SCHOOL_EMAIL,
  SCHOOL_TIMINGS, SCHOOL_OFFICE_HR,
} from '@/lib/brand';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';
import TurnstileCaptcha from '@/components/TurnstileCaptcha';

const PROGRAMS: { value: SchoolLevel; label: string }[] = [
  { value: 'PLAY_SCHOOL', label: 'Play School (1.5 – 2.5 yrs)' },
  { value: 'NURSERY',     label: 'Nursery (2.5 – 3.5 yrs)' },
  { value: 'LKG',         label: 'LKG (3.5 – 4.5 yrs)' },
  { value: 'UKG',         label: 'UKG (4.5 – 6 yrs)' },
];

type ActionType = 'ADMISSION_INFO' | 'CAMPUS_VISIT' | 'FEE_STRUCTURE' | 'GENERAL';

const ACTION_OPTIONS: { id: ActionType; label: string; icon: string; desc: string }[] = [
  { id: 'ADMISSION_INFO', label: 'Request Admission Info', icon: '📝', desc: 'Syllabus, timings & enrollment kit' },
  { id: 'CAMPUS_VISIT', label: 'Arrange Campus Visit', icon: '🏫', desc: 'Guided walkthrough with principal' },
  { id: 'FEE_STRUCTURE', label: 'Fee Structure & Transport', icon: '💳', desc: 'Transparent term fees & van routes' },
  { id: 'GENERAL', label: 'General Enquiry', icon: '💬', desc: 'Questions or feedback' },
];

export default function ContactPage() {
  const [actionType, setActionType] = useState<ActionType>('ADMISSION_INFO');
  const [form, setForm] = useState({
    parentName: '',
    phone: '',
    email: '',
    childName: '',
    childAge: '',
    targetLevel: 'PLAY_SCHOOL' as SchoolLevel,
    preferredVisitDate: '',
    preferredVisitTime: 'MORNING',
    message: '',
  });

  const [captchaToken, setCaptchaToken] = useState('');
  const [consentWhatsApp, setConsentWhatsApp] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.parentName.trim()) {
      errs.parentName = 'Parent or Guardian name is required.';
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      errs.phone = 'Please provide a valid 10-digit mobile number.';
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (actionType !== 'GENERAL' && !form.childName.trim()) {
      errs.childName = "Child's name is required for admissions or visits.";
    }
    if (actionType === 'CAMPUS_VISIT' && !form.preferredVisitDate) {
      errs.preferredVisitDate = 'Please select a preferred visit date.';
    }
    if (!captchaToken) {
      errs.captcha = 'Please complete the verification challenge below.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);

    const fullMessage = [
      `Enquiry Type: ${actionType}`,
      actionType === 'CAMPUS_VISIT' && form.preferredVisitDate
        ? `Preferred Visit: ${form.preferredVisitDate} (${form.preferredVisitTime})`
        : null,
      form.message.trim(),
    ].filter(Boolean).join('\n');

    const payload = {
      id: `enq-${Date.now()}`,
      parentName: form.parentName.trim(),
      email: form.email.trim() || `${form.phone.replace(/\D/g, '')}@parent.londonkids.local`,
      phone: form.phone.trim(),
      childName: form.childName.trim() || 'Prospective Student',
      childAge: form.childAge.trim() || 'N/A',
      targetLevel: form.targetLevel,
      message: fullMessage,
      submittedAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'NEW' as const,
    };

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          turnstileToken: captchaToken,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setGeneralError(json.error || 'Unable to submit enquiry at this time. Please try again or call us directly.');
        setLoading(false);
        return;
      }

      // Sync local store
      try {
        const store = getStore();
        saveStore({
          enquiries: [payload, ...store.enquiries],
        });
      } catch {
        // Non-blocking
      }

      setLoading(false);
      setSent(true);
    } catch {
      setGeneralError('Network connection error. Your entered data has been preserved; please click submit again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-br from-red-50 via-white to-yellow-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-100/70 px-3.5 py-1.5 rounded-full border border-red-200">
            Admissions &amp; Campus Enquiries
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Connect with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
              {SCHOOL_NAME}
            </span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            Plan a campus visit, enquire about age-appropriate admissions, or request fee schedules. We respond within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── Left: School Contact Information & Map ──────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                  School Campus Office
                </h2>

                <a
                  href={`tel:${SCHOOL_PHONE.replace(/\s/g,'')}`}
                  className="flex items-start gap-3.5 group p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors text-sm">
                      {SCHOOL_PHONE}
                    </p>
                    <p className="text-xs text-slate-500">Mon – Sat, 8:30 AM – 5:00 PM</p>
                  </div>
                </a>

                <a
                  href={`mailto:${SCHOOL_EMAIL}`}
                  className="flex items-start gap-3.5 group p-2.5 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors text-sm break-all">
                      {SCHOOL_EMAIL}
                    </p>
                    <p className="text-xs text-slate-500">Official Admissions Desk</p>
                  </div>
                </a>

                <div className="flex items-start gap-3.5 p-2.5">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Campus Address</p>
                    <p className="font-semibold text-slate-800 text-sm leading-snug">
                      {SCHOOL_ADDRESS},<br />{SCHOOL_CITY}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Near Avalurpet Bus Stand &amp; Chetpet Road</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">School &amp; Office Hours</p>
                    <p className="font-semibold text-slate-800 text-sm">{SCHOOL_TIMINGS}</p>
                    <p className="text-xs text-slate-500">{SCHOOL_OFFICE_HR}</p>
                  </div>
                </div>

                {/* Safe WhatsApp Link Button */}
                <div className="pt-2">
                  <a
                    href={getWhatsAppEnquiryUrl({
                      parentName: consentWhatsApp ? form.parentName : undefined,
                      childName: consentWhatsApp ? form.childName : undefined,
                      program: consentWhatsApp ? form.targetLevel : undefined,
                      hasConsent: consentWhatsApp,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-md shadow-emerald-100"
                  >
                    <MessageCircle size={18} />
                    <span>Quick Chat on WhatsApp</span>
                  </a>
                  <p className="text-[11px] text-center text-slate-400 mt-1.5">
                    Direct line with our school counselor: +91 90436 33545
                  </p>
                </div>
              </div>

              {/* Map view */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-100 h-10 flex items-center px-4 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin size={13} className="text-red-500" />
                    {SCHOOL_NAME} — Avalurpet
                  </span>
                </div>
                <iframe
                  title="School Location Map"
                  src="https://maps.google.com/maps?q=Avalurpet,Tamil+Nadu&output=embed"
                  width="100%"
                  height="220"
                  className="border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-500">
                    📍 Centrally located in Avalurpet with dedicated school van pickup.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right: Comprehensive Interactive Form ───────────────────────── */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-9">
                {sent ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Enquiry Confirmed!</h3>
                    <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                      Thank you, <strong className="text-slate-800">{form.parentName}</strong>. We have logged your{' '}
                      <span className="font-semibold text-red-600">
                        {ACTION_OPTIONS.find(a => a.id === actionType)?.label || 'Admission Enquiry'}
                      </span>{' '}
                      in our verified admissions portal.
                    </p>
                    <div className="bg-slate-50 rounded-2xl p-4 text-left max-w-md mx-auto border border-slate-100 text-xs space-y-1.5 text-slate-700">
                      <p><strong className="text-slate-900">Child:</strong> {form.childName || 'Prospective Student'}</p>
                      <p><strong className="text-slate-900">Program:</strong> {form.targetLevel}</p>
                      <p><strong className="text-slate-900">Phone:</strong> {form.phone}</p>
                      {actionType === 'CAMPUS_VISIT' && form.preferredVisitDate && (
                        <p><strong className="text-slate-900">Visit Scheduled:</strong> {form.preferredVisitDate} ({form.preferredVisitTime})</p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                      <a
                        href={getWhatsAppEnquiryUrl({
                          parentName: form.parentName,
                          childName: form.childName,
                          childAge: form.childAge,
                          program: form.targetLevel,
                          phone: form.phone,
                          hasConsent: consentWhatsApp,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={16} />
                        <span>Continue on WhatsApp</span>
                      </a>
                      <button
                        onClick={() => {
                          setSent(false);
                          setCaptchaToken('');
                          setForm({
                            parentName: '',
                            phone: '',
                            email: '',
                            childName: '',
                            childAge: '',
                            targetLevel: 'PLAY_SCHOOL',
                            preferredVisitDate: '',
                            preferredVisitTime: 'MORNING',
                            message: '',
                          });
                        }}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                      >
                        Submit Another Request
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                        How Can We Assist You?
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Select an action below. All submissions are directly recorded in our secure school administration system.
                      </p>
                    </div>

                    {/* Action Selector Chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                      {ACTION_OPTIONS.map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setActionType(opt.id);
                            if (generalError) setGeneralError(null);
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            actionType === opt.id
                              ? 'border-red-500 bg-red-50/70 ring-2 ring-red-200 shadow-sm'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <span className="text-lg block mb-1">{opt.icon}</span>
                          <span className="text-xs font-bold block leading-tight text-slate-900">{opt.label}</span>
                        </button>
                      ))}
                    </div>

                    {generalError && (
                      <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Submission Notice</p>
                          <p>{generalError}</p>
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Parent Name & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Parent / Guardian Name *
                          </label>
                          <input
                            required
                            name="parentName"
                            value={form.parentName}
                            onChange={handleChange}
                            placeholder="e.g. Priya Ramesh"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                              fieldErrors.parentName
                                ? 'border-red-400 bg-red-50/30'
                                : 'border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            }`}
                          />
                          {fieldErrors.parentName && (
                            <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.parentName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Mobile Phone Number *
                          </label>
                          <input
                            required
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="e.g. 98401 23456"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                              fieldErrors.phone
                                ? 'border-red-400 bg-red-50/30'
                                : 'border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            }`}
                          />
                          {fieldErrors.phone && (
                            <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address <span className="text-slate-400 font-normal">(Optional for admission packet)</span>
                        </label>
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="parent@example.com"
                          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                            fieldErrors.email
                              ? 'border-red-400 bg-red-50/30'
                              : 'border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.email}</p>
                        )}
                      </div>

                      {/* Child Name & Age */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Child&apos;s Full Name {actionType !== 'GENERAL' && '*'}
                          </label>
                          <input
                            required={actionType !== 'GENERAL'}
                            name="childName"
                            value={form.childName}
                            onChange={handleChange}
                            placeholder="e.g. Aarav Ramesh"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
                              fieldErrors.childName
                                ? 'border-red-400 bg-red-50/30'
                                : 'border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                            }`}
                          />
                          {fieldErrors.childName && (
                            <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.childName}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Child&apos;s Age / Date of Birth
                          </label>
                          <input
                            name="childAge"
                            value={form.childAge}
                            onChange={handleChange}
                            placeholder="e.g. 3 years 2 months"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Level & Visit Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Programme Level *
                          </label>
                          <select
                            required
                            name="targetLevel"
                            value={form.targetLevel}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm outline-none bg-white font-medium"
                          >
                            {PROGRAMS.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>

                        {actionType === 'CAMPUS_VISIT' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                              <Calendar size={13} className="text-red-500" />
                              Preferred Visit Date *
                            </label>
                            <input
                              type="date"
                              required
                              name="preferredVisitDate"
                              value={form.preferredVisitDate}
                              onChange={handleChange}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ${
                                fieldErrors.preferredVisitDate
                                  ? 'border-red-400 bg-red-50/30'
                                  : 'border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                              }`}
                            />
                            {fieldErrors.preferredVisitDate && (
                              <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.preferredVisitDate}</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Transportation Need
                            </label>
                            <select
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm outline-none bg-white font-medium"
                              onChange={(e) => {
                                setForm(f => ({
                                  ...f,
                                  message: f.message ? `${f.message} | Transport: ${e.target.value}` : `Transport requirement: ${e.target.value}`,
                                }));
                              }}
                            >
                              <option value="NO">Own Parent Drop &amp; Pickup</option>
                              <option value="YES_AVALURPET">School Van — Avalurpet Local</option>
                              <option value="YES_VILLAGE">School Van — Nearby Village Route</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Additional Questions or Requirements
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Tell us any dietary, batch timing, or previous daycare experience..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 text-sm outline-none resize-none"
                        />
                      </div>

                      {/* Server-Verified Turnstile Captcha */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Verification Security Challenge *
                        </label>
                        <TurnstileCaptcha
                          onVerify={(token) => {
                            setCaptchaToken(token);
                            if (fieldErrors.captcha) {
                              setFieldErrors(prev => {
                                const next = { ...prev };
                                delete next.captcha;
                                return next;
                              });
                            }
                          }}
                          onError={() => {
                            setFieldErrors(prev => ({ ...prev, captcha: 'Verification failed. Please retry.' }));
                          }}
                        />
                        {fieldErrors.captcha && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">{fieldErrors.captcha}</p>
                        )}
                      </div>

                      {/* WhatsApp Privacy Consent */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consentWhatsApp}
                            onChange={(e) => setConsentWhatsApp(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span>
                            <strong>Privacy Consent:</strong> I agree to share the child&apos;s admission preferences with London Kids Avalurpet staff via official SMS / WhatsApp messaging.
                          </span>
                        </label>
                      </div>

                      {/* Submit Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-red-200 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {loading ? '⏳ Submitting to Admissions Portal…' : '✨ Submit Official Request'}
                        </button>

                        <a
                          href={getWhatsAppEnquiryUrl({
                            parentName: consentWhatsApp ? form.parentName : undefined,
                            childName: consentWhatsApp ? form.childName : undefined,
                            childAge: consentWhatsApp ? form.childAge : undefined,
                            program: consentWhatsApp ? form.targetLevel : undefined,
                            phone: consentWhatsApp ? form.phone : undefined,
                            hasConsent: consentWhatsApp,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                          <MessageCircle size={18} />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <p className="text-center text-[11px] text-slate-400">
                        🔒 Server-protected submissions with strict role-based access. Entered data will not be lost if a recoverable validation error occurs.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
