'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, CheckCircle2, AlertTriangle, Sparkles, ImageIcon, Link as LinkIcon } from '@/components/Icons';
import { processImageFile } from '@/lib/imageUpload';
import { getStore, saveStore } from '@/lib/store';
import { EventPhoto, ActivityPost } from '@/types';

interface EventPhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (photo: EventPhoto) => void;
  defaultCategory?: EventPhoto['category'];
  currentUserName?: string;
}

const EVENT_PRESET_IMAGES = [
  { label: 'Annual Sports Day', url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=900&auto=format&fit=crop&q=80', cat: 'EVENTS' as const },
  { label: 'Color Day Party', url: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=900&auto=format&fit=crop&q=80', cat: 'ARTS' as const },
  { label: 'Puppet & Story Day', url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=900&auto=format&fit=crop&q=80', cat: 'CLASSROOM' as const },
  { label: 'Sensory Sand Play', url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=900&auto=format&fit=crop&q=80', cat: 'PLAY' as const },
  { label: 'Campus Nature Walk', url: 'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=900&auto=format&fit=crop&q=80', cat: 'CAMPUS' as const },
];

export default function EventPhotoUploadModal({
  isOpen,
  onClose,
  onSuccess,
  defaultCategory = 'EVENTS',
  currentUserName = 'School Staff'
}: EventPhotoUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<EventPhoto['category']>(defaultCategory);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [showOnPublic, setShowOnPublic] = useState(true);
  const [postToParentFeed, setPostToParentFeed] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [urlInputMode, setUrlInputMode] = useState(false);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      // Compress to high definition max 1200px width/height and 0.82 quality
      const optimized = await processImageFile(file, 1200, 0.82);
      setImageUrl(optimized);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process selected image.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileProcess(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!imageUrl) {
      setErrorMsg('Please select or upload a photo of the event first.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter an event title.');
      return;
    }

    const store = getStore();
    const eventId = `event-${Date.now()}`;

    const newPhoto: EventPhoto = {
      id: eventId,
      title: title.trim(),
      caption: caption.trim() || title.trim(),
      date,
      category,
      imageUrl,
      uploadedBy: currentUserName,
      showOnPublicWebsite: showOnPublic,
      createdAt: new Date().toISOString(),
    };

    const updatedGallery = [newPhoto, ...(store.gallery || [])];

    let updatedActivities = store.activities || [];
    if (postToParentFeed) {
      // Map gallery category to activity category
      const catMap: Record<EventPhoto['category'], ActivityPost['category']> = {
        EVENTS: 'Celebration',
        CLASSROOM: 'Story & Phonics',
        PLAY: 'Sensory & Play',
        ARTS: 'Arts & Crafts',
        CAMPUS: 'Outdoor Fun',
      };

      const newActivity: ActivityPost = {
        id: `act-${Date.now()}`,
        level: 'ALL', // Broadcast to all parents across entire preschool
        title: title.trim(),
        description: caption.trim() || `${title.trim()} conducted at London Kids Preschool Avalurpet.`,
        date,
        imageUrl,
        category: catMap[category] || 'Celebration',
        createdBy: currentUserName,
      };
      updatedActivities = [newActivity, ...updatedActivities];
    }

    saveStore({
      gallery: updatedGallery,
      activities: updatedActivities,
    });

    setSuccessToast(true);
    if (onSuccess) onSuccess(newPhoto);

    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Post School Event Photo</h2>
              <p className="text-xs text-red-100 font-medium">Publish celebration photos to the web gallery &amp; parent app</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>Event Photo Successfully Published to the Website!</span>
            </div>
          )}

          {/* Image Upload Area */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Event Photo *
              </label>
              <button
                type="button"
                onClick={() => setUrlInputMode(!urlInputMode)}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 underline flex items-center gap-1"
              >
                <LinkIcon size={12} />
                <span>{urlInputMode ? 'Switch to File Upload' : 'Paste Photo Web URL'}</span>
              </button>
            </div>

            {urlInputMode ? (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste any image link"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-3xl border-2 border-dashed transition-all p-5 text-center flex flex-col items-center justify-center cursor-pointer ${
                  isDragging
                    ? 'border-red-500 bg-red-50/70 scale-[1.01]'
                    : imageUrl
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-red-400 bg-slate-50/70'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imageUrl ? (
                  <div className="w-full relative group">
                    <img
                      src={imageUrl}
                      alt="Event Preview"
                      className="w-full h-56 object-cover rounded-2xl shadow-md border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white">
                      <Camera size={26} className="mb-1" />
                      <span className="text-xs font-bold uppercase tracking-wider">Click or Drop to Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center shadow-xs">
                      {isProcessing ? (
                        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {isProcessing ? 'Optimizing photo...' : 'Click to Upload Event Photo or Drag & Drop'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Select directly from your phone camera, gallery, or laptop (JPG, PNG, WebP)
                      </p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Quick Presets for Rapid Posting */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Quick Sample Photos:
              </span>
              {EVENT_PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    if (!title) setTitle(preset.label);
                    setCategory(preset.cat);
                  }}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-[11px] font-semibold text-slate-600 transition-colors flex items-center gap-1.5"
                >
                  <img src={preset.url} alt="" className="w-4 h-4 rounded-full object-cover" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Annual Day 2026 / Pongal Fest"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gallery Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'EVENTS' as const, label: '🎉 Events', desc: 'Festivals & Carnivals' },
                { id: 'CLASSROOM' as const, label: '📚 Classroom', desc: 'Phonics & Learning' },
                { id: 'PLAY' as const, label: '🎠 Play & Sports', desc: 'Outdoor & Sand' },
                { id: 'ARTS' as const, label: '🎨 Arts & Crafts', desc: 'Coloring & Clay' },
                { id: 'CAMPUS' as const, label: '🏫 Campus', desc: 'Gardens & Facilities' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    category === tab.id
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-extrabold text-xs">{tab.label}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{tab.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Caption / Highlights */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Event Caption &amp; Story Highlights
            </label>
            <textarea
              rows={2}
              placeholder="What did the children do, celebrate, or achieve during this event?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Publishing Options */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Where will this photo be posted?
            </span>
            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnPublic}
                onChange={(e) => setShowOnPublic(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>Display on Public Website Photo Gallery (<code>/gallery</code>)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={postToParentFeed}
                onChange={(e) => setPostToParentFeed(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
              />
              <span>Also broadcast to Parents' Activity Feed in Parent Portal</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera size={16} />
              <span>Publish Event Photo to Web</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
