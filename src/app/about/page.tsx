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
    name: 'Dr. R. Arumugam',
    role: 'Principal & Head of Institution',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
    note: 'Ph.D., M.Ed., Early Childhood Education — Leading academic excellence, holistic child development, and institutional governance.',
  },
  {
    name: 'Mrs. Lakshmi Priya',
    role: 'Founder & Managing Director',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    note: 'M.Ed., Child Psychology — 20 years pioneering experiential UK-concept preschool education.',
  },
  {
    name: 'Mr. Saravanan K',
    role: 'Campus Administrator',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    note: 'MBA, Educational Operations — Directs admissions, campus facilities, and safety infrastructure.',
  },
  {
    name: 'Mrs. Kavitha Raman',
    role: 'Senior Faculty – Play School & Nursery',
    img: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80',
    note: 'B.Ed., Montessori Certified — Specialist in tactile sensory play and early socialization.',
  },
  {
    name: 'Ms. Priya Sundaram',
    role: 'Senior Faculty – LKG & UKG',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    note: 'D.T.Ed., Phonics & Early Numeracy — Expert in primary school readiness and reading fluency.',
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

      {/* ── Desk of the Principal Section ─────────────────────── */}
      <section id="principal-desk" className="py-20 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Principal Portrait & Designation Badges */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80"
                    alt="Dr. R. Arumugam - Principal, London Kids Preschool Avalurpet"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider shadow-lg whitespace-nowrap">
                  Principal &amp; Head
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-2xl font-black text-white">Dr. R. Arumugam</h3>
                <p className="text-amber-300 font-bold text-sm">Ph.D., M.Ed. (Early Childhood Education)</p>
                <p className="text-xs text-blue-200/80 mt-1">Institutional Head &amp; Principal • London Kids Avalurpet</p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-blue-200 text-[11px] font-semibold">
                  22+ Years in Pedagogy
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-emerald-300 text-[11px] font-semibold">
                  Montessori &amp; EYFS Certified
                </span>
              </div>
            </div>

            {/* Letter from the Desk of the Principal */}
            <div className="lg:col-span-8 bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-black text-[10px] uppercase tracking-wider border border-amber-400/30">
                    Institutional Leadership
                  </span>
                  <span className="text-xs text-blue-200/80">Academic Year 2026-27</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  From the Desk of the Principal
                </h2>
              </div>

              <blockquote className="space-y-4 text-blue-100/90 text-sm sm:text-base leading-relaxed font-normal">
                <p>
                  &ldquo;A warm and heartfelt welcome to <strong>London Kids Preschool Avalurpet</strong>. In early childhood education, our mission is not merely to prepare children for elementary school, but to ignite their lifelong wonder, empathy, and creative curiosity.&rdquo;
                </p>
                <p>
                  &ldquo;At our Avalurpet campus, we blend the globally respected <strong>UK Early Childhood Framework</strong> with rooted Indian values, attentive 1:8 educator ratios, and complete campus safety. Every child is treated as an individual of limitless promise.&rdquo;
                </p>
                <p>
                  &ldquo;As Principal, my office maintains an open-door policy for all parents. Together, as partners in education, we will ensure your little one blossoms into a confident, joyful, and articulate young learner.&rdquo;
                </p>
              </blockquote>

              {/* Key Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-amber-400 font-black text-xs block">🎯 Academic Rigor</span>
                  <p className="text-[11px] text-blue-200/70">Phonics, language fluency &amp; sensorial development</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-emerald-400 font-black text-xs block">🛡️ Absolute Safety</span>
                  <p className="text-[11px] text-blue-200/70">100% CCTV monitored with trained pediatric first-aid</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-sky-400 font-black text-xs block">🤝 Parent Portal</span>
                  <p className="text-[11px] text-blue-200/70">Daily live activity, attendance &amp; fee transparency</p>
                </div>
              </div>

              {/* Actions & Official Desk Contact */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-blue-200/80 space-y-0.5 text-center sm:text-left">
                  <p><strong>Principal&apos;s Direct Office:</strong> +91 94432 18899 • +91 90436 33545</p>
                  <p><strong>Official Email:</strong> principal.londonkids@gmail.com</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/#contact"
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs transition-colors shadow-md"
                  >
                    Schedule Meeting
                  </Link>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
                  >
                    Principal Portal 🔐
                  </Link>
                </div>
              </div>
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
