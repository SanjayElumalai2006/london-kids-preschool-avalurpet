'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, ArrowRight } from '@/components/Icons';
import { SCHOOL_NAME } from '@/lib/brand';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';

type Level = 'ALL' | 'PLAY_SCHOOL' | 'NURSERY' | 'LKG' | 'UKG';

const PROGRAMS = [
  {
    id: 'PLAY_SCHOOL' as Level,
    emoji: '🧸',
    badge: 'Ages 1.5 – 2.5 yrs',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cardBorder: 'border-yellow-300 hover:border-yellow-500',
    headerBg: 'from-yellow-400 to-amber-400',
    title: 'Play School',
    subtitle: 'Little Cubs',
    tagline: 'First steps into a world of wonder',
    desc: 'Our Play School is a warm, nurturing space for babies and toddlers making their very first foray into group learning. Every activity is gentle, sensory-rich, and parent-reassuring.',
    highlights: [
      'Morning & evening circle songs, rhymes, and actions',
      'Sensory bins — sand, water, rice, soft dough',
      'Gross motor play — crawling, rolling, climbing safely',
      'Building social awareness and sharing through guided play',
      'Daily nap routine and hygiene habits',
      'Separation-anxiety support for parents and children',
    ],
    img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
    feeLabel: '₹18,000/year',
  },
  {
    id: 'NURSERY' as Level,
    emoji: '🌱',
    badge: 'Ages 2.5 – 3.5 yrs',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cardBorder: 'border-emerald-300 hover:border-emerald-500',
    headerBg: 'from-emerald-400 to-teal-400',
    title: 'Nursery',
    subtitle: 'Little Ducklings',
    tagline: 'Building the foundations of reading & counting',
    desc: 'Nursery introduces children to pre-literacy and early numeracy using tactile materials, colourful pictures, and joyful repetition. Language blossoms here.',
    highlights: [
      'Pre-reading — picture books, alphabet recognition (A–Z)',
      'Phonics introduction using picture-word matching',
      'Counting 1–20 with manipulatives and songs',
      'Fine motor development — pencil grip, tear & paste craft',
      'Creative expression — finger painting, clay, collage',
      'Bilingual communication (English + Tamil)',
    ],
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80',
    feeLabel: '₹22,000/year',
  },
  {
    id: 'LKG' as Level,
    emoji: '🔤',
    badge: 'Ages 3.5 – 4.5 yrs',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    cardBorder: 'border-sky-300 hover:border-sky-500',
    headerBg: 'from-sky-400 to-blue-400',
    title: 'LKG',
    subtitle: 'Butterflies — Lower Kindergarten',
    tagline: 'Phonics, writing & mathematical concepts',
    desc: 'Lower Kindergarten transitions children from play into structured early academic foundations — phonics, handwriting practice, and simple maths — while keeping learning joyful.',
    highlights: [
      'Systematic phonics (CVC words, blends, sight words)',
      'Handwriting — letter formation, pencil control worksheets',
      'Mathematics — addition, subtraction, patterns up to 50',
      'Environmental science — seasons, plants, animals',
      'Craft-based project learning and show-and-tell',
      'Confidence-building storytelling and group presentations',
    ],
    img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80',
    feeLabel: '₹26,000/year',
  },
  {
    id: 'UKG' as Level,
    emoji: '🎓',
    badge: 'Ages 4.5 – 6 yrs',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    cardBorder: 'border-rose-300 hover:border-rose-500',
    headerBg: 'from-rose-400 to-red-500',
    title: 'UKG',
    subtitle: 'Wise Owls — Upper Kindergarten',
    tagline: 'School-readiness & critical thinking',
    desc: 'Our UKG programme is the bridge to primary school. Children develop reading fluency, arithmetic skills, logical thinking, and the social confidence to thrive in Class 1.',
    highlights: [
      'Reading fluency — sentences, short stories, comprehension',
      'Arithmetic — 2-digit addition, subtraction, word problems',
      'Critical thinking puzzles, sequence activities, and experiments',
      'Social studies — community helpers, festivals, map basics',
      'Leadership activities — class monitors, assembly anchoring',
      'Primary school orientation and interview preparation',
    ],
    img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    feeLabel: '₹30,000/year',
  },
];

const TABS: { id: Level; label: string }[] = [
  { id: 'ALL',        label: 'All Programs' },
  { id: 'PLAY_SCHOOL',label: '🧸 Play School' },
  { id: 'NURSERY',    label: '🌱 Nursery' },
  { id: 'LKG',        label: '🔤 LKG' },
  { id: 'UKG',        label: '🎓 UKG' },
];

export default function ProgramsPage() {
  const [active, setActive] = useState<Level>('ALL');

  const visible = active === 'ALL' ? PROGRAMS : PROGRAMS.filter(p => p.id === active);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-20 bg-gradient-to-br from-red-50 via-white to-yellow-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-100/50 rounded-full blur-3xl -z-10" />
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Academic Programmes
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            Four Programmes,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              One Joyful Journey
            </span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            {SCHOOL_NAME} offers carefully staged learning paths — from a child&apos;s first social steps to confident primary school readiness.
          </p>
        </div>
      </section>

      {/* ── Filter Tabs ─────────────────────────────────────── */}
      <div className="sticky top-[88px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                active === id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Program Cards ───────────────────────────────────── */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {visible.map(({ id, emoji, badge, badgeColor, cardBorder, headerBg, title, subtitle, tagline, desc, highlights, img, feeLabel }) => (
            <div key={id} className={`bg-white rounded-3xl border-2 ${cardBorder} shadow-md hover:shadow-xl transition-all overflow-hidden`}>
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Image */}
                <div className="lg:col-span-2 aspect-video lg:aspect-auto overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover" />
                </div>
                {/* Content */}
                <div className="lg:col-span-3 flex flex-col">
                  {/* Header band */}
                  <div className={`bg-gradient-to-r ${headerBg} px-7 py-4 flex items-center justify-between`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{emoji}</span>
                        <h2 className="text-xl font-black text-white">{title}</h2>
                      </div>
                      <p className="text-white/80 text-xs font-semibold">{subtitle}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border bg-white/90 ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-7 flex-1 flex flex-col gap-4">
                    <p className="text-sm font-bold text-slate-700 italic">&ldquo;{tagline}&rdquo;</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                    <ul className="space-y-2 flex-1">
                      {highlights.map(h => (
                        <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-500">Annual Fee: <strong className="text-slate-800">{feeLabel}</strong></span>
                      <div className="flex items-center gap-2">
                        <a
                          href={getWhatsAppEnquiryUrl({ program: id })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors shadow-2xs"
                        >
                          <span>💬 WhatsApp</span>
                        </a>
                        <Link
                          href="/enquiry"
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-md"
                        >
                          Enquire Now <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-14 bg-gradient-to-r from-red-600 to-rose-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="text-3xl font-black">Not sure which programme is right?</h2>
          <p className="text-red-100 text-sm">Talk to us — we&apos;ll guide you to the best fit for your child&apos;s age and readiness.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/enquiry"
              className="px-7 py-3.5 rounded-2xl bg-yellow-400 text-slate-900 font-extrabold text-sm hover:bg-yellow-300 transition-colors shadow-xl">
              ✨ Schedule a Free Campus Visit
            </Link>
            <a href={getWhatsAppEnquiryUrl()} target="_blank" rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm hover:scale-102 transition-all shadow-xl flex items-center gap-2">
              💬 Enquire on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
