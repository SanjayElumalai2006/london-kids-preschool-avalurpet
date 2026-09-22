'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock, CheckCircle2, MessageCircle } from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { SchoolLevel } from '@/types';
import {
  SCHOOL_NAME, SCHOOL_ADDRESS, SCHOOL_CITY,
  SCHOOL_PHONE, SCHOOL_WHATSAPP, SCHOOL_EMAIL,
  SCHOOL_TIMINGS, SCHOOL_OFFICE_HR,
} from '@/lib/brand';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';

const PROGRAMS: { value: SchoolLevel; label: string }[] = [
  { value: 'PLAY_SCHOOL', label: 'Play School (1.5 – 2.5 yrs)' },
  { value: 'NURSERY',     label: 'Nursery (2.5 – 3.5 yrs)' },
  { value: 'LKG',         label: 'LKG (3.5 – 4.5 yrs)' },
  { value: 'UKG',         label: 'UKG (4.5 – 6 yrs)' },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    parentName: '', phone: '', email: '',
    childName: '', childAge: '',
    targetLevel: 'PLAY_SCHOOL' as SchoolLevel,
    message: '',
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const store = getStore();
      saveStore({
        enquiries: [
          {
            id: `enq-${Date.now()}`,
            parentName: form.parentName,
            email: form.email,
            phone: form.phone,
            childName: form.childName,
            childAge: form.childAge,
            targetLevel: form.targetLevel,
            message: form.message || 'Enquiry from Contact page',
            submittedAt: new Date().toLocaleString(),
            status: 'NEW',
          },
          ...store.enquiries,
        ],
      });
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-yellow-50">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            We&apos;d Love to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              Hear From You
            </span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Reach out for admissions, campus visits, or any questions about {SCHOOL_NAME}.
          </p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

            {/* ── Left: Info + Map ──────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact card */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-7 space-y-5">
                <h2 className="text-xl font-black text-slate-800">Get in Touch</h2>

                <a href={`tel:${SCHOOL_PHONE.replace(/\s/g,'')}`}
                   className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                    <p className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{SCHOOL_PHONE}</p>
                  </div>
                </a>

                <a href={`mailto:${SCHOOL_EMAIL}`}
                   className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                    <p className="font-bold text-slate-800 group-hover:text-sky-600 transition-colors break-all">{SCHOOL_EMAIL}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</p>
                    <p className="font-semibold text-slate-700 leading-snug">{SCHOOL_ADDRESS},<br />{SCHOOL_CITY}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">School Hours</p>
                    <p className="font-semibold text-slate-700 text-sm">{SCHOOL_TIMINGS}<br />{SCHOOL_OFFICE_HR}</p>
                  </div>
                </div>

                <a
                  href={getWhatsAppEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md shadow-emerald-100"
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp (+91 90436 33545)</span>
                </a>
              </div>

              {/* Map placeholder */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
                <div className="bg-slate-100 h-10 flex items-center px-4 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <MapPin size={13} className="text-red-500" />
                    {SCHOOL_NAME} — Avalurpet, Tamil Nadu
                  </span>
                </div>
                {/* Google Maps embed — update the src with the actual embed URL once available */}
                <iframe
                  title="School Location Map"
                  src="https://maps.google.com/maps?q=Avalurpet,Tamil+Nadu&output=embed"
                  width="100%"
                  height="220"
                  className="border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <p className="text-center text-xs text-slate-400 py-2">
                  📍 Map is approximate — contact us for precise directions.
                </p>
              </div>
            </div>

            {/* ── Right: Enquiry Form ───────────────────────── */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-7 sm:p-9">
                {sent ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={36} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">Thank You!</h3>
                    <p className="text-slate-600 text-sm">
                      Your admission enquiry has been received. Our team will contact you within 24 hours. 🎉
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={getWhatsAppEnquiryUrl({
                          parentName: form.parentName,
                          childName: form.childName,
                          childAge: form.childAge,
                          program: form.targetLevel,
                          phone: form.phone
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <MessageCircle size={16} />
                        <span>Continue on WhatsApp</span>
                      </a>
                      <button
                        onClick={() => { setSent(false); setForm({ parentName:'', phone:'', email:'', childName:'', childAge:'', targetLevel:'PLAY_SCHOOL', message:'' }); }}
                        className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors cursor-pointer"
                      >
                        Submit Another Enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-black text-slate-800">Admission Enquiry</h2>
                      <p className="text-sm text-slate-500 mt-1">Fill in the details below — we&apos;ll get back to you within 24 hours.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Parent / Guardian Name *</label>
                          <input required name="parentName" value={form.parentName} onChange={handleChange}
                            placeholder="e.g. Priya Kumar"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                          <input required name="phone" value={form.phone} onChange={handleChange}
                            placeholder="+91 XXXXX XXXXX" type="tel"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                        <input name="email" value={form.email} onChange={handleChange}
                          placeholder="yourname@example.com" type="email"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Child&apos;s Name *</label>
                          <input required name="childName" value={form.childName} onChange={handleChange}
                            placeholder="e.g. Arjun Kumar"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1">Child&apos;s Age *</label>
                          <input required name="childAge" value={form.childAge} onChange={handleChange}
                            placeholder="e.g. 3.5 years"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Programme *</label>
                        <select required name="targetLevel" value={form.targetLevel} onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm bg-white">
                          {PROGRAMS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Message (optional)</label>
                        <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                          placeholder="Any specific questions, preferred batch timings, or requirements..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none text-sm resize-none" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-base shadow-lg shadow-red-200 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                        >
                          {loading ? '⏳ Sending…' : '✨ Submit Enquiry'}
                        </button>
                        <a
                          href={getWhatsAppEnquiryUrl({
                            parentName: form.parentName,
                            childName: form.childName,
                            childAge: form.childAge,
                            program: form.targetLevel,
                            phone: form.phone
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg shadow-emerald-200 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                          <MessageCircle size={18} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                      <p className="text-center text-xs text-slate-400">
                        Your details are safe with us. We will never share your information.
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
