'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SCHOOL_NAME } from '@/lib/brand';
import { getStore } from '@/lib/store';
import { EventPhoto, GalleryCategory } from '@/types';
import { INITIAL_GALLERY_PHOTOS } from '@/lib/initialData';
import { Camera, Plus, Calendar, Sparkles, Users } from '@/components/Icons';
import EventPhotoUploadModal from '@/components/EventPhotoUploadModal';

const TABS: { id: GalleryCategory; label: string }[] = [
  { id: 'ALL',       label: 'All Photos' },
  { id: 'EVENTS',    label: '🎉 Events & Fest' },
  { id: 'CLASSROOM', label: '📚 Classroom' },
  { id: 'PLAY',      label: '🎠 Play & Sports' },
  { id: 'ARTS',      label: '🎨 Arts & Crafts' },
  { id: 'CAMPUS',    label: '🏫 Campus' },
];

export default function GalleryPage() {
  const [active, setActive] = useState<GalleryCategory>('ALL');
  const [photos, setPhotos] = useState<EventPhoto[]>(INITIAL_GALLERY_PHOTOS);
  const [lightbox, setLightbox] = useState<EventPhoto | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('School Staff');

  const loadPhotos = () => {
    const store = getStore();
    if (store.gallery && Array.isArray(store.gallery) && store.gallery.length > 0) {
      // Filter only photos enabled for public website
      const publicPhotos = store.gallery.filter(p => p.showOnPublicWebsite !== false);
      setPhotos(publicPhotos);
    } else {
      setPhotos(INITIAL_GALLERY_PHOTOS);
    }

    if (store.currentUser) {
      setCurrentUserRole(store.currentUser.role);
      setCurrentUserName(store.currentUser.name || 'School Educator');
    }
  };

  useEffect(() => {
    loadPhotos();
    window.addEventListener('preschool_store_updated', loadPhotos);
    return () => window.removeEventListener('preschool_store_updated', loadPhotos);
  }, []);

  const isStaff = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN' || currentUserRole === 'TEACHER';

  const visible = active === 'ALL' ? photos : photos.filter(i => i.category === active);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-gradient-to-br from-red-50 via-white to-amber-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 bg-red-100/70 px-3.5 py-1.5 rounded-full border border-red-200 shadow-2xs">
            <Sparkles size={14} className="text-red-500" />
            <span>Preschool Photo Gallery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
            Life &amp; Celebrations at{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">
              London Kids
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Joyful learning, colourful events, festive celebrations, and cherished campus memories at {SCHOOL_NAME}.
          </p>

          {/* Quick Staff Action */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-red-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Camera size={18} />
              <span>Post New Event Photo</span>
            </button>

            <Link
              href="/portal/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm shadow-2xs transition-colors"
            >
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Filter Tabs ───────────────────────────────────── */}
      <div className="sticky top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between gap-3 py-3">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
            {TABS.map(({ id, label }) => {
              const count = id === 'ALL' ? photos.length : photos.filter(p => p.category === id).length;
              return (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    active === id
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active === id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="hidden sm:block text-xs font-bold text-slate-400">
            {visible.length} photos
          </span>
        </div>
      </div>

      {/* ── Photos Grid ───────────────────────────────────── */}
      <section className="py-10 bg-slate-50/70 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
            {visible.map((item) => (
              <div
                key={item.id}
                className="break-inside-avoid rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white border border-slate-200 cursor-pointer group relative flex flex-col"
                onClick={() => setLightbox(item)}
              >
                <div className="relative overflow-hidden aspect-4/3 bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{item.date}</span>
                    </span>
                    {item.uploadedBy && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.uploadedBy}
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.caption && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <Camera size={44} className="mx-auto text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-700">No photos in this category yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Click below to upload the first photo for this category!</p>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                + Post Event Photo
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Fullscreen Lightbox ───────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative bg-slate-950 flex items-center justify-center max-h-[75vh]">
              <img
                src={lightbox.imageUrl}
                alt={lightbox.title}
                className="w-full max-h-[72vh] object-contain"
              />
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/90 text-white rounded-full flex items-center justify-center font-bold text-lg transition-transform hover:scale-110 cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-white space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 font-black text-xs uppercase tracking-wider border border-red-200">
                    {lightbox.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                    <Calendar size={13} /> {lightbox.date}
                  </span>
                </div>
                {lightbox.uploadedBy && (
                  <span className="text-xs text-slate-500 font-medium">
                    Posted by: <strong>{lightbox.uploadedBy}</strong>
                  </span>
                )}
              </div>

              <h2 className="font-black text-xl text-slate-900">{lightbox.title}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{lightbox.caption}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Photo Upload Modal ──────────────────────── */}
      <EventPhotoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        defaultCategory={active === 'ALL' ? 'EVENTS' : active}
        currentUserName={currentUserName}
        onSuccess={() => loadPhotos()}
      />

      <Footer />
    </div>
  );
}
