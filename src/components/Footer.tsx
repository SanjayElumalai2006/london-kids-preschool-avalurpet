import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Heart, ShieldCheck, Clock } from '@/components/Icons';
import SchoolLogo from '@/components/SchoolLogo';
import {
  SCHOOL_NAME,
  SCHOOL_SHORT,
  SCHOOL_TAGLINE,
  SCHOOL_ADDRESS,
  SCHOOL_CITY,
  SCHOOL_PHONE,
  SCHOOL_WHATSAPP,
  SCHOOL_EMAIL,
  SCHOOL_TIMINGS,
  SCHOOL_OFFICE_HR,
  SOCIAL,
} from '@/lib/brand';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand Col ───────────────────────────────────── */}
          <div className="space-y-4">
            <div className="space-y-3">
              <img
                src="/logo/logo-wide.jpg"
                alt="London Kids Preschool Avalurpet"
                className="h-14 sm:h-16 w-auto object-contain bg-white p-1.5 rounded-xl shadow-md"
              />
              <p className="font-extrabold text-base text-white tracking-tight">
                London Kids Preschool Avalurpet
              </p>
            </div>
            <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">
              UK Concept International Preschool Chain
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {SCHOOL_TAGLINE}. Serving the families of Avalurpet with joyful, play-based early childhood education.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck size={16} />
              Certified Early Childhood Educators
            </div>

            {/* Social links */}
            <div className="flex gap-3 pt-1">
              <a href={SOCIAL.facebook}  target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                 className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors text-sm font-bold">f</a>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-pink-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors text-sm font-bold">in</a>
              <a href={SOCIAL.youtube}   target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                 className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-red-600 flex items-center justify-center text-slate-300 hover:text-white transition-colors text-sm font-bold">▶</a>
            </div>
          </div>

          {/* ── Programs ─────────────────────────────────────── */}
          <div>
            <h3 className="font-bold mb-4 uppercase text-xs text-red-400 tracking-wider">
              Our Programs
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { dot: 'bg-yellow-400', label: 'Play School (1.5 – 2.5 yrs)' },
                { dot: 'bg-emerald-400',label: 'Nursery (2.5 – 3.5 yrs)' },
                { dot: 'bg-sky-400',    label: 'LKG – Lower Kindergarten (3.5 – 4.5 yrs)' },
                { dot: 'bg-rose-400',   label: 'UKG – Upper Kindergarten (4.5 – 6 yrs)' },
                { dot: 'bg-purple-400', label: 'Extended Daycare & After-School' },
              ].map(({ dot, label }) => (
                <li key={label}>
                  <Link href="/#programs" className="hover:text-white transition-colors flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick Links ──────────────────────────────────── */}
          <div>
            <h3 className="font-bold mb-4 uppercase text-xs text-red-400 tracking-wider">
              Portals &amp; Info
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1.5">
                  🔐 Parent Portal Login
                </Link>
              </li>
              <li><Link href="/login" className="hover:text-white transition-colors">👩‍🏫 Teacher Portal</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">⚙️ Admin &amp; Owner Dashboard</Link></li>
              <li><Link href="/#gallery" className="hover:text-white transition-colors">📸 Campus Photo Gallery</Link></li>
              <li><Link href="/#about" className="hover:text-white transition-colors">🛡️ Safety &amp; Hygiene Protocols</Link></li>
              <li><Link href="/#contact" className="hover:text-white transition-colors">📋 Admission Enquiry</Link></li>
            </ul>
          </div>

          {/* ── Contact ──────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className="font-bold mb-4 uppercase text-xs text-red-400 tracking-wider">
              Campus &amp; Contact
            </h3>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <MapPin size={18} className="text-red-400 shrink-0 mt-0.5" />
              <span>{SCHOOL_ADDRESS}, {SCHOOL_CITY}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Phone size={18} className="text-emerald-400 shrink-0" />
              <a href={`tel:${SCHOOL_PHONE.replace(/\s/g,'')}`} className="hover:text-white transition-colors">{SCHOOL_PHONE}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Mail size={18} className="text-sky-400 shrink-0" />
              <a href={`mailto:${SCHOOL_EMAIL}`} className="hover:text-white transition-colors break-all">{SCHOOL_EMAIL}</a>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-400">
              <Clock size={18} className="text-yellow-400 shrink-0 mt-0.5" />
              <span>{SCHOOL_TIMINGS}<br />{SCHOOL_OFFICE_HR}</span>
            </div>
            <a
              href={`https://wa.me/${SCHOOL_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              💬 WhatsApp Us
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {SCHOOL_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart size={14} className="text-rose-500 fill-rose-500 mx-0.5" />
            <span>for little learners of Avalurpet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
