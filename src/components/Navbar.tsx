'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Menu, X, Phone, ShieldCheck, Sparkles } from '@/components/Icons';
import SchoolLogo from '@/components/SchoolLogo';
import {
  SCHOOL_NAME,
  SCHOOL_SHORT,
  SCHOOL_PHONE,
} from '@/lib/brand';

const NAV_LINKS = [
  { href: '/about',         label: 'About & Leadership' },
  { href: '/#programs',     label: 'Programs' },
  { href: '/#facilities',   label: 'Facilities' },
  { href: '/gallery',       label: 'Gallery' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/#contact',      label: 'Contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-red-100 shadow-sm">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
            <strong>Admissions Open 2026-27</strong>: Play School · Nursery · LKG · UKG
          </span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/about#principal-desk" className="flex items-center gap-1 opacity-95 hover:underline text-amber-200 font-bold">
              <span>🎓 Principal Desk</span>
            </Link>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-1.5 opacity-90">
              <Phone size={13} /> {SCHOOL_PHONE}
            </span>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-1.5 opacity-90">
              <ShieldCheck size={13} /> Safe &amp; CCTV Monitored
            </span>
            <span className="opacity-50 hidden lg:inline">|</span>
            <span className="hidden lg:flex items-center gap-1 text-amber-300 font-extrabold text-[11px] tracking-wide">
              <Sparkles size={11} className="text-yellow-300" /> 7hills web solution
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* ── Logo + Brand Name ─────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 group" aria-label="London Kids Preschool Avalurpet">
            {/* Desktop Wide Logo */}
            <div className="hidden sm:flex items-center gap-2.5">
              <img
                src="/logo/logo-wide.jpg"
                alt="London Kids Preschool Avalurpet"
                className="h-14 sm:h-16 w-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
              <div className="hidden lg:flex flex-col border-l-2 border-slate-200 pl-2.5 leading-tight">
                <span className="text-xs font-black text-slate-900 tracking-tight">Preschool</span>
                <span className="text-[11px] font-bold text-red-600">Avalurpet</span>
              </div>
            </div>

            {/* Mobile Logo */}
            <div className="flex sm:hidden items-center gap-2">
              <img
                src="/logo/logo.png"
                alt="London Kids Preschool Avalurpet"
                className="h-11 w-11 object-contain rounded-full border border-yellow-300 shadow-xs"
              />
              <div>
                <span className="font-black text-base text-slate-900 block leading-tight">
                  London<span className="text-red-600">Kids</span>
                </span>
                <span className="text-[10px] font-bold text-slate-600 block">
                  Avalurpet
                </span>
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Action CTAs ───────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-sm border border-red-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <GraduationCap size={18} />
              <span className="hidden sm:inline">Portal Login</span>
              <span className="sm:hidden">Login</span>
            </Link>

            <Link
              href="/#contact"
              className="hidden lg:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-md shadow-red-200 transition-all hover:scale-105 active:scale-95"
            >
              Enrol Now
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-red-100 px-4 pt-3 pb-6 space-y-1 shadow-lg animate-fadeIn">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-600 text-white font-bold text-base shadow-md"
            >
              <GraduationCap size={20} />
              Login to Portal (Parents &amp; Staff)
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-yellow-400 text-slate-900 font-bold text-base"
            >
              ✨ Apply for Admission
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
