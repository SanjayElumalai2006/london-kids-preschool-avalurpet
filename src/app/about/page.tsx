'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SchoolLogo from '@/components/SchoolLogo';
import { Heart, ShieldCheck, Award, Users, BookOpen, Star, CheckCircle2 } from '@/components/Icons';
import { SCHOOL_NAME, SCHOOL_TAGLINE } from '@/lib/brand';

const VALUES = [
  {
    icon: <Heart size={28} />,
    color: 'bg-rose-500',
    bg: 'bg-rose-50 border-rose-200',
    title: 'Child-Centric Love',
    desc: 'Every child deserves to feel seen and celebrated. Our teachers build warm, trusting bonds that allow children to explore freely and confidently.',
  },
  {
    icon: <ShieldCheck size={28} />,
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Uncompromising Safety',
    desc: 'CCTV-monitored indoor and outdoor zones, biometric entry, child-safe rounded furniture, and trained pediatric first-aid attendants on every shift.',
  },
  {
    icon: <Award size={28} />,
    color: 'bg-amber-500',
    bg: 'bg-amber-50 border-amber-200',
    title: 'UK-Concept Curriculum',
    desc: 'Our play-way and Montessori-inspired curriculum is modelled on the globally respected London Kids early childhood framework — balancing structure with creativity.',
  },
  {
    icon: <Users size={28} />,
    color: 'bg-sky-500',
    bg: 'bg-sky-50 border-sky-200',
    title: 'Exceptional Teachers',
    desc: 'Our educators are certified early-childhood specialists who receive ongoing training. We maintain a 1:8 teacher-to-child ratio across all classes.',
  },
  {
    icon: <BookOpen size={28} />,
    color: 'bg-purple-500',
    bg: 'bg-purple-50 border-purple-200',
    title: 'Holistic Development',
    desc: 'We develop cognitive, physical, social, and emotional skills equally — through storytelling, art, music, outdoor play, and mindfulness activities.',
  },
  {
    icon: <Star size={28} />,
    color: 'bg-orange-500',
    bg: 'bg-orange-50 border-orange-200',
    title: 'Parent Partnership',
    desc: 'Our Parent Portal gives real-time visibility into daily attendance, teacher remarks, activity photos, and fee statements — keeping you always connected.',
  },
];

const MILESTONES = [
  { year: '2014', text: 'London Kids Preschool Avalurpet founded — first batch of 30 joyful learners.' },
  { year: '2016', text: 'Expanded to LKG & UKG classes; new smart classrooms added.' },
  { year: '2018', text: 'Introduced the Parent Portal for real-time updates and fee management.' },
  { year: '2020', text: 'Successfully conducted online learning programmes during the pandemic.' },
  { year: '2022', text: 'Crossed 500+ alumni; new indoor sensory and art studio inaugurated.' },
  { year: '2024', text: 'Launched extended daycare and GPS-tracked school transport.' },
];

const TEAM = [
  {
    name: 'Mrs. Lakshmi Priya',
    role: 'Founder & Director',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    note: 'M.Ed., Child Psychology — 20 years in early childhood education.',
  },
  {
    name: 'Mr. Rajesh Kumar',
    role: 'School Administrator',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    note: 'MBA, School Management — oversees admissions and daily operations.',
  },
  {
    name: 'Ms. Meena Devi',
    role: 'Head Teacher – LKG',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    note: 'B.Ed., Montessori certified — 10 years shaping early learners.',
  },
  {
    name: 'Mrs. Anita Das',
    role: 'Head Teacher – Nursery',
    img: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80',
    note: 'D.T.Ed., Sensory Play specialist — warm mentor for tiny tots.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Page Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16 lg:py-24 bg-gradient-to-br from-red-50 via-white to-yellow-50">
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-100/60 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100/40 rounded-full blur-3xl -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-3 mb-2">
            <SchoolLogo size={64} variant="primary" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              {SCHOOL_NAME}
            </span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {SCHOOL_TAGLINE}. For over a decade we have been Avalurpet&apos;s most trusted preschool — a place where every child&apos;s potential blooms.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ──────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                Our Mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                Nurturing Tomorrow&apos;s Thinkers With Heart &amp; Care
              </h2>
              <p className="text-slate-600 leading-relaxed">
                At {SCHOOL_NAME}, we believe the earliest years lay the foundation for a lifetime of learning. Our UK-concept, play-based curriculum combines Montessori tactile exploration with structured phonics, creative arts, and emotional development — in a safe, nurturing, CCTV-monitored environment.
              </p>
              <ul className="space-y-3">
                {[
                  'Play-way learning that sparks natural curiosity',
                  'Bilingual communication (English + Tamil) from Nursery onwards',
                  'Safe, hygienic, child-proofed classrooms and play areas',
                  'CCTV monitoring and biometric gate access',
                  'Nutritious mid-day snack programme',
                  'Real-time Parent Portal for daily updates',
                ].map(pt => (
                  <li key={pt} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    {pt}
                  </li>
                ))}
              </ul>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow-md shadow-red-200"
              >
                Schedule a Campus Visit →
              </Link>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video">
              <img
                src="https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80"
                alt="Children learning happily at London Kids Preschool"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Values ───────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              What We Stand For
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon, color, bg, title, desc }) => (
              <div key={title} className={`rounded-3xl p-7 border ${bg} hover:shadow-lg transition-shadow space-y-4`}>
                <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-md`}>
                  {icon}
                </div>
                <h3 className="text-lg font-black text-slate-800">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey / Timeline ────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Our Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">10+ Years of Joyful Learning</h2>
          </div>
          <ol className="relative border-l-2 border-red-200 space-y-8 ml-4">
            {MILESTONES.map(({ year, text }) => (
              <li key={year} className="ml-6">
                <span className="absolute -left-3.5 mt-1 w-6 h-6 bg-red-600 rounded-full border-4 border-white shadow flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white" />
                </span>
                <span className="text-xs font-black text-red-600 uppercase tracking-wider">{year}</span>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Our Team ──────────────────────────────────────────── */}
      <section className="py-16 bg-red-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
              Our People
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Meet the Team</h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              Dedicated educators who treat every child as their own.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, img, note }) => (
              <div key={name} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-shadow text-center">
                <div className="aspect-square overflow-hidden">
                  <img src={img} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 space-y-1">
                  <h4 className="font-black text-slate-800 text-sm">{name}</h4>
                  <p className="text-xs font-bold text-red-600">{role}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Strip ─────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-red-600 to-rose-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl font-black">Ready to Join the London Kids Family?</h2>
          <p className="text-red-100 text-sm">Admissions open for Play School, Nursery, LKG &amp; UKG — 2026-27.</p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-400 text-slate-900 font-extrabold text-base hover:bg-yellow-300 transition-colors shadow-xl"
          >
            ✨ Apply for Admission
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
