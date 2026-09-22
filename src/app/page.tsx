'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdmissionModal from '@/components/AdmissionModal';
import { 
  Sun, Sparkles, Heart, ShieldCheck, Award, 
  Users, BookOpen, Star, MapPin, Phone, Mail, 
  Clock, ArrowRight, CheckCircle2, ChevronRight, MessageCircle 
} from '@/components/Icons';
import { SchoolLevel } from '@/types';
import { getStore, saveStore } from '@/lib/store';
import { getWhatsAppEnquiryUrl } from '@/lib/whatsapp';

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<SchoolLevel>('PLAY_SCHOOL');
  const [activeGalleryTab, setActiveGalleryTab] = useState<'ALL' | 'CLASSROOM' | 'PLAY' | 'EVENTS' | 'ARTS'>('ALL');

  // Inline Enquiry Form State
  const [enquiryForm, setEnquiryForm] = useState({
    parentName: '',
    phone: '',
    email: '',
    childName: '',
    childAge: '',
    targetLevel: 'PLAY_SCHOOL' as SchoolLevel,
    message: ''
  });
  const [enquirySent, setEnquirySent] = useState(false);

  const handleOpenAdmission = (level: SchoolLevel) => {
    setSelectedLevel(level);
    setModalOpen(true);
  };

  const handleInlineEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    const newEnquiry = {
      id: `enq-${Date.now()}`,
      parentName: enquiryForm.parentName,
      email: enquiryForm.email,
      phone: enquiryForm.phone,
      childName: enquiryForm.childName,
      childAge: enquiryForm.childAge,
      targetLevel: enquiryForm.targetLevel,
      message: enquiryForm.message || 'Campus visit & admission enquiry from homepage contact section.',
      submittedAt: new Date().toLocaleString(),
      status: 'NEW' as const
    };

    saveStore({
      enquiries: [newEnquiry, ...store.enquiries]
    });

    setEnquirySent(true);
  };

  // Gallery items
  const galleryItems = [
    {
      category: 'PLAY',
      title: 'Sensory Sand & Splash Pool',
      caption: 'Water play and castle building',
      img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80'
    },
    {
      category: 'CLASSROOM',
      title: 'Montessori Phonics & Letters',
      caption: 'Tactile wooden alphabet blocks',
      img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80'
    },
    {
      category: 'ARTS',
      title: 'Finger Painting & Color Mixing',
      caption: 'Creative expression with non-toxic colors',
      img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80'
    },
    {
      category: 'EVENTS',
      title: 'Annual London Kids Carnival',
      caption: 'Grandparents, parents and children celebrating together',
      img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80'
    },
    {
      category: 'CLASSROOM',
      title: 'Interactive Story Circle',
      caption: 'Morning puppet shows and vocabulary building',
      img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&auto=format&fit=crop&q=80'
    },
    {
      category: 'PLAY',
      title: 'Indoor Soft Play Gym',
      caption: 'Motor skills obstacle courses and balancing fun',
      img: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const filteredGallery = activeGalleryTab === 'ALL' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeGalleryTab);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800 selection:bg-orange-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Playful background decorative shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Logo + Welcome Banner */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <img
                  src="/logo/logo.png"
                  alt="London Kids Preschool Avalurpet"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-lg border-2 border-yellow-400 bg-white object-contain p-1.5 shrink-0 hover:rotate-3 transition-transform"
                />
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/90 border border-amber-300/70 text-amber-900 text-xs font-bold uppercase tracking-wider shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Admissions Open for Academic Year 2026-27</span>
                  </div>
                  <p className="text-xs font-extrabold text-red-600 uppercase tracking-widest">
                    UK Concept International Preschool Chain
                  </p>
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Where Joyful <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 via-amber-500 to-rose-500">
                  Learning &amp; Wonder
                </span> Begins!
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Welcome to <strong>London Kids Preschool Avalurpet</strong>. We offer nurturing, play-based early childhood education across <strong>Play School, Nursery, LKG, and UKG</strong> in a loving, safe, CCTV-monitored environment.
              </p>

              {/* Badges row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-amber-100 shadow-xs">
                  <ShieldCheck size={16} className="text-emerald-500" /> 1:8 Teacher-Student Ratio
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-amber-100 shadow-xs">
                  <Heart size={16} className="text-rose-500" /> Ages 1.5 to 6 Years
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-amber-100 shadow-xs">
                  <Award size={16} className="text-orange-500" /> Montessori + Play-Way
                </span>
              </div>

              {/* Hero Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => handleOpenAdmission('PLAY_SCHOOL')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-linear-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-300/50 hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={18} />
                  <span>Apply Online</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href={getWhatsAppEnquiryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-200 hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle size={18} className="text-emerald-100" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <a
                  href="#programs"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-orange-50 text-slate-800 font-bold text-sm sm:text-base border-2 border-orange-200 shadow-sm hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen size={18} className="text-orange-500" />
                  <span>4 Programs</span>
                </a>
              </div>

              {/* Trust endorsement */}
              <div className="pt-3 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-500">
                <div className="flex -space-x-2">
                  <span className="w-8 h-8 rounded-full border-2 border-white bg-amber-400 flex items-center justify-center font-bold text-[10px] text-white">4.9★</span>
                  <span className="w-8 h-8 rounded-full border-2 border-white bg-emerald-400 flex items-center justify-center font-bold text-[10px] text-white">200+</span>
                  <span className="w-8 h-8 rounded-full border-2 border-white bg-rose-400 flex items-center justify-center font-bold text-[10px] text-white">❤</span>
                </div>
                <p>Loved by <strong>200+ local families</strong> in Avalurpet</p>
              </div>
            </div>

            {/* Right Visual Image Grid */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Photo */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 relative">
                  <img
                    src="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&auto=format&fit=crop&q=80"
                    alt="Happy Preschool Children Smiling in Classroom"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-5">
                    <p className="text-white text-sm font-bold drop-shadow-md">
                      Interactive Sensory & Play-Way Classrooms
                    </p>
                  </div>
                </div>

                {/* Floating mini badge 1 */}
                <div className="absolute -top-4 -left-6 bg-white rounded-2xl p-3.5 shadow-xl border-2 border-amber-200 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase">Curriculum</span>
                    <span className="text-xs font-black text-slate-800">Play-Way Certified</span>
                  </div>
                </div>

                {/* Floating mini badge 2 */}
                <div className="absolute -bottom-6 -right-4 bg-white rounded-2xl p-3.5 shadow-xl border-2 border-emerald-200 flex items-center gap-3 animate-float-delayed">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-bold block uppercase">Parent Portal</span>
                    <span className="text-xs font-black text-slate-800">Daily Live Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-white border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              About London Kids
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Nurturing Tomorrow&apos;s Thinkers With Heart & Care
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Founded on the belief that the earliest years form the architecture of a child&apos;s mind, London Kids Preschool Avalurpet combines hands-on Montessori tactile exploration with playful socialization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-amber-50/60 rounded-3xl p-8 border border-amber-200/80 hover:shadow-lg transition-shadow space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-200">
                <Heart size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Child-Centric Warmth</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every child is unique. Our warm teachers observe each child&apos;s natural pace, guiding emotional security, curiosity, and joyful self-expression.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-emerald-50/60 rounded-3xl p-8 border border-emerald-200/80 hover:shadow-lg transition-shadow space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                <ShieldCheck size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Uncompromising Safety</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                100% CCTV monitored indoor & outdoor zones, child-safe rounded furniture, biometric gate check-in, and pediatric first-aid trained attendants.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-sky-50/60 rounded-3xl p-8 border border-sky-200/80 hover:shadow-lg transition-shadow space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200">
                <Award size={30} />
              </div>
              <h3 className="text-xl font-black text-slate-800">Connected Parents</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our secure Parent Portal gives you direct daily transparency into attendance, activity photos, teacher evaluations, report cards, and fee receipts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section (4 Levels) */}
      <section id="programs" className="py-20 bg-amber-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Our 4 Educational Levels
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Programs Tailored To Every Developmental Stage
            </h2>
            <p className="text-slate-600 text-base">
              Carefully staged curriculums designed to transition infants and toddlers into confident, curious primary school achievers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Play School */}
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 hover:border-amber-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                    Ages 1.5 – 2.5 yrs
                  </span>
                  <span className="text-2xl">🧸</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                  Play School
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Batch: 9:00 AM – 11:30 AM
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gentle transition from home to school. Focus on sensory tactile play, music rhythm, basic speech, and separation confidence.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Sensory sandbox & water play</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Nursery rhymes & action songs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Gross motor obstacle crawling</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => handleOpenAdmission('PLAY_SCHOOL')}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Enquire for Play School
                </button>
              </div>
            </div>

            {/* 2. Nursery */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Ages 2.5 – 3.5 yrs
                  </span>
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  Nursery
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Batch: 8:45 AM – 12:00 PM
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Pre-reading phonics, counting numbers 1-10, finger painting, social sharing, and independent potty and dining habits.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Letter recognition & sounds</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Fine motor grip & clay modeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Social collaboration games</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => handleOpenAdmission('NURSERY')}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Enquire for Nursery
                </button>
              </div>
            </div>

            {/* 3. LKG */}
            <div className="bg-white rounded-3xl p-6 border-2 border-sky-200 hover:border-sky-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group relative">
              <div className="absolute -top-3 right-5 bg-sky-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                Popular
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                    Ages 3.5 – 4.5 yrs
                  </span>
                  <span className="text-2xl">🦋</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-sky-600 transition-colors">
                  LKG (Lower KG)
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Batch: 8:30 AM – 12:30 PM
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Structured phonics (A-Z), sight words, counting 1-50, basic addition concepts, environmental science, and conversation skills.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Pencil holding & print letters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Science wonders & nature study</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Bilingual public speaking circle</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => handleOpenAdmission('LKG')}
                  className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Enquire for LKG
                </button>
              </div>
            </div>

            {/* 4. UKG */}
            <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 hover:border-rose-400 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                    Ages 4.5 – 6.0 yrs
                  </span>
                  <span className="text-2xl">🦉</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800 group-hover:text-rose-600 transition-colors">
                  UKG (Upper KG)
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Batch: 8:30 AM – 1:15 PM
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Full primary readiness. CVC words reading, writing sentences, numbers 1-100, logical thinking, arithmetic, and STEM projects.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Independent book reading</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Math addition & subtraction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    <span>Graduation Day certification</span>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => handleOpenAdmission('UKG')}
                  className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Enquire for UKG
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Activities Section */}
      <section id="facilities" className="py-20 bg-white border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Campus & Amenities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              World-Class Facilities Designed For Little Explorers
            </h2>
            <p className="text-slate-600 text-base">
              Bright, airy, germ-sanitized environments that inspire children to move, build, discover, and express their imagination freely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-amber-50/40 transition-colors">
              <span className="text-3xl">🤸</span>
              <h3 className="text-lg font-bold text-slate-800">Indoor Sensory Gym</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Padded soft-play structures, mini balance beams, foam ball pits, and swing hammocks to develop gross motor coordination safely.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-emerald-50/40 transition-colors">
              <span className="text-3xl">💦</span>
              <h3 className="text-lg font-bold text-slate-800">Splash Pool & Sand Zone</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Supervised warm water splash area and organic sanitized sandpit for tactile sensory experiments, floating physics, and pure joy.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-sky-50/40 transition-colors">
              <span className="text-3xl">📺</span>
              <h3 className="text-lg font-bold text-slate-800">Smart Interactive Classrooms</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive touchscreens displaying animated phonics, animal wildlife documentaries, and sing-along rhymes in an engaging audio-visual setup.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-rose-50/40 transition-colors">
              <span className="text-3xl">🎨</span>
              <h3 className="text-lg font-bold text-slate-800">Art & Pottery Workshop</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Child-height easels, edible organic paints, clay wheel stations, and craft materials where imaginations turn into colorful masterpieces.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-purple-50/40 transition-colors">
              <span className="text-3xl">🚌</span>
              <h3 className="text-lg font-bold text-slate-800">GPS-Tracked Safe Transport</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Air-conditioned mini-vans with 3-point seatbelts, female attendants on every route, and live GPS tracking accessible from the Parent Portal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 hover:bg-amber-50/40 transition-colors">
              <span className="text-3xl">🥗</span>
              <h3 className="text-lg font-bold text-slate-800">Nutritious Kitchen & Meals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Freshly prepared morning fruits and afternoon snacks prepared by certified nutritionists, catering to all allergy and dietary preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section id="gallery" className="py-20 bg-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Campus Life In Action
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Moments of Joy, Discovery & Friendship
            </h2>
            <p className="text-slate-600 text-base">
              A glimpse into the everyday magic experienced by our students at London Kids Preschool Avalurpet.
            </p>

            {/* Gallery Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {[
                { key: 'ALL', label: 'All Photos' },
                { key: 'CLASSROOM', label: 'Classrooms' },
                { key: 'PLAY', label: 'Play Areas' },
                { key: 'ARTS', label: 'Arts & Craft' },
                { key: 'EVENTS', label: 'Celebrations' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveGalleryTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeGalleryTab === tab.key
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200 scale-103'
                      : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item, index) => (
              <div
                key={index}
                className="group rounded-3xl overflow-hidden shadow-md bg-white border-2 border-amber-100 hover:shadow-xl transition-all"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-semibold">{item.caption}</p>
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-0.5">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Happy Parents
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              What Families Say About London Kids
            </h2>
            <p className="text-slate-600 text-base">
              Real feedback from parents of our Nursery, Play School, LKG, and UKG children.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="p-8 rounded-3xl bg-amber-50/50 border border-amber-200/70 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;Our son Aarav joined LKG here after we relocated. The change in his conversational vocabulary and confidence is remarkable. The Parent Portal is our favorite feature—we see pictures of his activities every week and pay fees effortlessly!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-amber-200/60">
                <div className="w-10 h-10 rounded-full bg-orange-400 text-white font-bold flex items-center justify-center text-xs">
                  NS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Neha & Rahul Sharma</h4>
                  <span className="text-xs text-orange-600 font-semibold">Parents of Aarav (LKG)</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="p-8 rounded-3xl bg-emerald-50/50 border border-emerald-200/70 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;Sending our 2-year old daughter to Play School felt daunting, but the teachers welcomed Kabir with immense warmth. The 1:8 teacher ratio means he gets individualized attention, and potty training was handled gently.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-emerald-200/60">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
                  TJ
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Tina & Rohan Joshi</h4>
                  <span className="text-xs text-emerald-600 font-semibold">Parents of Kabir (Play School)</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="p-8 rounded-3xl bg-sky-50/50 border border-sky-200/70 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;Riya is graduating from UKG this summer and heading to primary school. Her reading readiness, math foundation, and social manners are outstanding. London Kids Preschool Avalurpet has given her the best possible start!&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-sky-200/60">
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs">
                  MS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Meera & Kunal Sen</h4>
                  <span className="text-xs text-sky-600 font-semibold">Parents of Riya (UKG)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Admission Enquiry Form Section */}
      <section id="contact" className="py-20 bg-amber-50/40 border-t border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Info & Campus Map Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  Campus Visit & Inquiries
                </span>
                <h2 className="text-3xl font-black text-slate-900">
                  Book A Campus Tour Or Speak With Our Admissions Team
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We warmly invite prospective parents to tour our classrooms, observe children at play, and meet our teachers and director.
                </p>
              </div>

              {/* Contact card */}
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-md space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Campus Location</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Main Road, Near Bus Stand, Avalurpet, Avalurpet, Tamil Nadu � 606 702
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Admissions Phone & WhatsApp</h4>
                    <p className="text-xs text-slate-600 mt-0.5">+91 90436 33545</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Visiting Hours</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Monday to Friday: 9:00 AM – 3:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Simulated Location Map Card */}
              <div className="rounded-3xl overflow-hidden border-2 border-amber-200 bg-white shadow-md p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">📍 Campus Map (Sunflower Gardens)</span>
                  <span className="text-emerald-600">Open in GPS</span>
                </div>
                <div className="h-44 rounded-2xl bg-amber-100 flex items-center justify-center relative overflow-hidden border border-amber-200">
                  <div className="absolute inset-0 bg-radial from-amber-200 to-amber-300 opacity-70"></div>
                  <div className="relative text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center mx-auto shadow-md animate-bounce-subtle">
                      <Sun size={20} />
                    </div>
                    <p className="font-extrabold text-xs text-slate-800 mt-2">London Kids Preschool Avalurpet</p>
                    <p className="text-[11px] text-slate-600">Rainbow Ave & 5th Crossing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-amber-200 relative">
                {enquirySent ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800">
                      Enquiry Submitted Successfully! 🎈
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you, <strong>{enquiryForm.parentName}</strong>. We have logged your request for <strong>{enquiryForm.childName}</strong>. Your enquiry is now live in our Admin Portal, and our counseling office will contact you today!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <a
                        href={getWhatsAppEnquiryUrl({
                          parentName: enquiryForm.parentName,
                          childName: enquiryForm.childName,
                          childAge: enquiryForm.childAge,
                          program: enquiryForm.targetLevel,
                          phone: enquiryForm.phone
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-colors flex items-center gap-2"
                      >
                        <MessageCircle size={15} />
                        <span>Chat on WhatsApp (+91 90436 33545)</span>
                      </a>
                      <button
                        onClick={() => setEnquirySent(false)}
                        className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Send Another Enquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5 text-orange-500 font-bold text-xs uppercase tracking-wider mb-1">
                      <Sparkles size={16} /> Fast Online Admission Enquiry
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                      Take The First Step Today
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Fill out this quick form and our admissions coordinator will reach out promptly with fee brochures and tour dates.
                    </p>

                    <form onSubmit={handleInlineEnquirySubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Parent Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={enquiryForm.parentName}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, parentName: e.target.value })}
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
                            placeholder="+91 90436 33545"
                            value={enquiryForm.phone}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="parent@example.com"
                          value={enquiryForm.email}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Child&apos;s Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Leo Jenkins"
                            value={enquiryForm.childName}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, childName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Age / DOB *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 3 yrs"
                            value={enquiryForm.childAge}
                            onChange={(e) => setEnquiryForm({ ...enquiryForm, childAge: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Program Level *
                        </label>
                        <select
                          value={enquiryForm.targetLevel}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, targetLevel: e.target.value as SchoolLevel })}
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
                          Message or Question (Optional)
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Ask about school hours, daycare, transport, or syllabus..."
                          value={enquiryForm.message}
                          onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                        />
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          className="flex-1 py-3.5 rounded-xl bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-md shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>Submit Admission Enquiry</span>
                          <ArrowRight size={18} />
                        </button>
                        <a
                          href={getWhatsAppEnquiryUrl({
                            parentName: enquiryForm.parentName,
                            childName: enquiryForm.childName,
                            childAge: enquiryForm.childAge,
                            program: enquiryForm.targetLevel,
                            phone: enquiryForm.phone
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                        >
                          <MessageCircle size={18} />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Admission Modal */}
      <AdmissionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultLevel={selectedLevel}
      />
    </div>
  );
}
