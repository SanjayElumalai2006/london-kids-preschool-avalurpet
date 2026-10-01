'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Sparkles, Send, MessageCircle, AlertCircle } from '@/components/Icons';
import { SchoolLevel } from '@/types';
import { getStore, saveStore } from '@/lib/store';
import TurnstileCaptcha from '@/components/TurnstileCaptcha';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: SchoolLevel;
}

export default function AdmissionModal({ isOpen, onClose, defaultLevel = 'PLAY_SCHOOL' }: AdmissionModalProps) {
  const [formData, setFormData] = useState({
    parentName: '',
    phone: '',
    email: '',
    childName: '',
    childAge: '',
    targetLevel: defaultLevel,
    message: ''
  });

  const [captchaToken, setCaptchaToken] = useState('');
  const [consentWhatsApp, setConsentWhatsApp] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      setErrorMessage('Please complete the verification security challenge below.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const newEnquiry = {
      id: `enq-${Date.now()}`,
      parentName: formData.parentName.trim(),
      email: formData.email.trim() || `${cleanPhone}@parent.londonkids.local`,
      phone: formData.phone.trim(),
      childName: formData.childName.trim(),
      childAge: formData.childAge.trim(),
      targetLevel: formData.targetLevel,
      message: formData.message.trim() || 'Admission application submitted via website popup modal.',
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
          ...newEnquiry,
          turnstileToken: captchaToken,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(json.error || 'Failed to submit admission application. Please check details and try again.');
        setIsSubmitting(false);
        return;
      }

      // Sync local store
      try {
        const store = getStore();
        saveStore({
          enquiries: [newEnquiry, ...store.enquiries],
        });
      } catch {
        // Non-blocking
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setErrorMessage('Network connection error. Your entered application data is preserved; please retry.');
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setCaptchaToken('');
    setErrorMessage(null);
    setFormData({
      parentName: '',
      phone: '',
      email: '',
      childName: '',
      childAge: '',
      targetLevel: defaultLevel,
      message: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-100 relative my-8">
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              Admission Enquiry Received! 🎉
            </h3>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Thank you, <strong>{formData.parentName}</strong>! We have received your inquiry for <strong>{formData.childName}</strong>. Our admissions counselor will contact you at <strong>{formData.phone}</strong> within 24 hours to schedule your campus visit.
            </p>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-medium">
              💡 <em>Note: Your enquiry has been synchronized to the London Kids Avalurpet Admissions Desk.</em>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={getWhatsAppEnquiryUrl({
                  parentName: consentWhatsApp ? formData.parentName : undefined,
                  childName: consentWhatsApp ? formData.childName : undefined,
                  childAge: consentWhatsApp ? formData.childAge : undefined,
                  program: consentWhatsApp ? formData.targetLevel : undefined,
                  phone: consentWhatsApp ? formData.phone : undefined,
                  hasConsent: consentWhatsApp,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle size={15} />
                <span>Continue on WhatsApp</span>
              </a>
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-wider mb-1">
              <Sparkles size={16} /> Admissions 2026-27
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              Apply for Child Admission
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Take the first step toward your child&apos;s joyful learning journey. Fill out the details below.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Meenakshi S"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 98401 23456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="parent@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Child&apos;s Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    placeholder="e.g. Kavin S"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Child&apos;s Age *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.childAge}
                    onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
                    placeholder="e.g. 3 years 2 months"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Program Level *
                </label>
                <select
                  value={formData.targetLevel}
                  onChange={(e) => setFormData({ ...formData, targetLevel: e.target.value as SchoolLevel })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                >
                  <option value="PLAY_SCHOOL">Play School (Ages 1.5 - 2.5 yrs)</option>
                  <option value="NURSERY">Nursery (Ages 2.5 - 3.5 yrs)</option>
                  <option value="LKG">LKG - Lower Kindergarten (Ages 3.5 - 4.5 yrs)</option>
                  <option value="UKG">UKG - Upper Kindergarten (Ages 4.5 - 6 yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes / Specific Queries
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your preferred batch, transport needs, or daycare..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Verification Security Challenge *
                </label>
                <TurnstileCaptcha
                  onVerify={(token) => setCaptchaToken(token)}
                  onError={() => setErrorMessage('Verification challenge failed. Please retry.')}
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentWhatsApp}
                    onChange={(e) => setConsentWhatsApp(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span>
                    Share admission details with London Kids counselors on WhatsApp.
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Submit Official Admission Enquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
