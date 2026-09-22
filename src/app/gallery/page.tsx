'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SCHOOL_NAME } from '@/lib/brand';

type GalleryCategory = 'ALL' | 'CLASSROOM' | 'PLAY' | 'ARTS' | 'EVENTS' | 'CAMPUS';

const GALLERY_ITEMS = [
  { cat: 'CLASSROOM', title: 'Phonics Learning Circle', caption: 'LKG Butterflies with alphabet tiles', img: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=700&auto=format&fit=crop&q=80' },
  { cat: 'PLAY',      title: 'Sensory Sand & Splash', caption: 'Outdoor sand and water play', img: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=700&auto=format&fit=crop&q=80' },
  { cat: 'ARTS',      title: 'Finger Painting Rainbows', caption: 'Nursery Ducklings with non-toxic colours', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=700&auto=format&fit=crop&q=80' },
  { cat: 'EVENTS',    title: 'Annual Carnival Day', caption: 'Parents & children celebrating together', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=700&auto=format&fit=crop&q=80' },
  { cat: 'CLASSROOM', title: 'Story Puppet Theatre', caption: 'Storytelling & vocabulary building', img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=700&auto=format&fit=crop&q=80' },
  { cat: 'PLAY',      title: 'Indoor Soft Play Gym', caption: 'Motor skills obstacle course', img: 'https://images.unsplash.com/photo-1596464716127-f2a829822301?w=700&auto=format&fit=crop&q=80' },
  { cat: 'ARTS',      title: 'Clay Modelling Session', caption: 'Fine motor development through sculpting', img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=700&auto=format&fit=crop&q=80' },
  { cat: 'EVENTS',    title: 'Grandparents Day Tea', caption: 'Special handmade cards and songs', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=80' },
  { cat: 'CAMPUS',    title: 'Smart Classroom', caption: 'Interactive whiteboard learning', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=700&auto=format&fit=crop&q=80' },
  { cat: 'CLASSROOM', title: 'Morning Assembly', caption: 'Yoga, prayer and pledge every morning', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&auto=format&fit=crop&q=80' },
  { cat: 'CAMPUS',    title: 'Outdoor Garden Play', caption: 'Nature walk and planting activity', img: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=700&auto=format&fit=crop&q=80' },
  { cat: 'ARTS',      title: 'Color Day Celebration', caption: 'Yellow Day — lemon art and lemonade stand', img: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=700&auto=format&fit=crop&q=80' },
];

const TABS: { id: GalleryCategory; label: string }[] = [
  { id: 'ALL',       label: 'All Photos' },
  { id: 'CLASSROOM', label: '📚 Classroom' },
  { id: 'PLAY',      label: '🎠 Play & Sports' },
  { id: 'ARTS',      label: '🎨 Arts & Crafts' },
  { id: 'EVENTS',    label: '🎉 Events' },
  { id: 'CAMPUS',    label: '🏫 Campus' },
];

export default function GalleryPage() {
  const [active, setActive] = useState<GalleryCategory>('ALL');
  const [lightbox, setLightbox] = useState<typeof GALLERY_ITEMS[0] | null>(null);

  const visible = active === 'ALL' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(i => i.cat === active);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-white to-yellow-50">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Photo Gallery
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900">
            Life at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              London Kids
            </span>
          </h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Glimpses of joyful learning, creative exploration, and memorable celebrations at {SCHOOL_NAME}.
          </p>
        </div>
      </section>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="sticky top-[88px] z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 flex gap-1.5 overflow-x-auto py-3 scrollbar-hide">
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

      {/* ── Grid ──────────────────────────────────────────── */}
      <section className="py-10 bg-slate-50 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {visible.map((item, i) => (
              <div
                key={i}
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group relative"
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div>
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <p className="text-white/70 text-xs">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visible.length === 0 && (
            <p className="text-center text-slate-400 py-20">No photos in this category yet.</p>
          )}
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <img src={lightbox.img} alt={lightbox.title} className="w-full max-h-[70vh] object-contain bg-slate-100" />
            <div className="p-5">
              <h3 className="font-black text-slate-800">{lightbox.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{lightbox.caption}</p>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-slate-600 hover:text-red-600 font-bold text-lg"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
