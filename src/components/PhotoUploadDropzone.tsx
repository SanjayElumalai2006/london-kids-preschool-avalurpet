'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, Link as LinkIcon, RefreshCw } from '@/components/Icons';
import { processImageFile } from '@/lib/imageUpload';
import { UserRole } from '@/types';

export interface PhotoPreset {
  label: string;
  url: string;
  category?: UserRole | 'GENERAL';
}

export const ROLE_PHOTO_PRESETS: PhotoPreset[] = [
  // Owner & Admin
  { label: 'School Director (Owner)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80', category: 'OWNER' },
  { label: 'Administrator', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80', category: 'ADMIN' },
  
  // Teachers / Faculty
  { label: 'Female Teacher (Class Educator)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80', category: 'TEACHER' },
  { label: 'Activity Educator', url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=300&auto=format&fit=crop&q=80', category: 'TEACHER' },
  
  // Staff
  { label: 'Transport / Security Staff', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80', category: 'STAFF' },
  { label: 'Daycare & Hygiene Staff', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80', category: 'STAFF' },
  
  // Parents
  { label: 'Parent (Mother)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80', category: 'PARENT' },
  { label: 'Parent (Father)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80', category: 'PARENT' },
  
  // Students (Boys & Girls)
  { label: 'Student (Boy)', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80', category: 'STUDENT' },
  { label: 'Student (Girl)', url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300&auto=format&fit=crop&q=80', category: 'STUDENT' },
  { label: 'Student (Play School)', url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&auto=format&fit=crop&q=80', category: 'STUDENT' }
];

interface PhotoUploadDropzoneProps {
  currentPhoto: string;
  onPhotoChange: (photoDataUrl: string) => void;
  targetRole?: UserRole;
  label?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function PhotoUploadDropzone({
  currentPhoto,
  onPhotoChange,
  targetRole,
  label = 'Profile Photo / Avatar',
  subtitle = 'Upload a photo from your computer/device or choose from preschool presets.',
  size = 'md'
}: PhotoUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(currentPhoto);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const optimizedUrl = await processImageFile(file, 380, 0.88);
      onPhotoChange(optimizedUrl);
      setCustomUrl(optimizedUrl);
      setSuccessMsg('Photo uploaded and optimized successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process the uploaded photo.';
      setErrorMsg(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset so same file can be re-selected if needed
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
    if (file) {
      handleFile(file);
    }
  };

  // Filter presets prioritizing the current target role
  const recommendedPresets = targetRole
    ? ROLE_PHOTO_PRESETS.filter(p => p.category === targetRole)
    : ROLE_PHOTO_PRESETS;
  const otherPresets = targetRole
    ? ROLE_PHOTO_PRESETS.filter(p => p.category !== targetRole)
    : [];

  const avatarSizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32'
  }[size];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
            {label}
          </label>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-red-600 hover:text-red-700 underline flex items-center gap-1"
        >
          <LinkIcon size={12} />
          <span>{showUrlInput ? 'Hide URL Box' : 'Paste Image URL'}</span>
        </button>
      </div>

      {/* Main Upload Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center gap-4 ${
          isDragging
            ? 'border-red-500 bg-red-50/70 scale-[1.01]'
            : 'border-dashed border-slate-300 hover:border-red-400 bg-slate-50/60'
        }`}
      >
        {/* Avatar Preview with Click-to-Upload Overlay */}
        <div className="relative group shrink-0">
          <div className={`${avatarSizeClasses} rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white relative`}>
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                <Camera size={32} />
              </div>
            )}

            {/* Hover overlay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-center p-1"
              title="Click to select a photo from your computer"
            >
              <Camera size={20} className="mb-0.5" />
              <span className="text-[9px] font-bold uppercase tracking-wider leading-tight">
                Upload New
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
            title="Upload photo file"
          >
            <Camera size={14} />
          </button>
        </div>

        {/* Upload Controls & Actions */}
        <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload size={14} />
              <span>{isProcessing ? 'Optimizing...' : 'Upload Photo from Device'}</span>
            </button>

            {currentPhoto && (
              <button
                type="button"
                onClick={() => {
                  const fallback = ROLE_PHOTO_PRESETS.find(p => p.category === targetRole)?.url || ROLE_PHOTO_PRESETS[0].url;
                  onPhotoChange(fallback);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset to default preset avatar"
              >
                <RefreshCw size={13} />
                <span>Reset Default</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-snug">
            Drag and drop your photo file here or click <strong>Upload Photo from Device</strong>. Works with JPG, PNG, WEBP from mobile cameras and desktops.
          </p>

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Direct URL Input Toggle */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 animate-fadeIn">
          <label className="block text-[11px] font-bold text-slate-700">
            Direct Image Web URL:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={e => setCustomUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-red-400"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrl.trim()) {
                  onPhotoChange(customUrl.trim());
                  setSuccessMsg('Photo URL applied!');
                  setTimeout(() => setSuccessMsg(null), 3000);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shrink-0"
            >
              Apply URL
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Preset Avatars Selector */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Or Select from Verified School Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {recommendedPresets.map((p, idx) => {
            const isSelected = currentPhoto === p.url;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => {
                  onPhotoChange(p.url);
                  setCustomUrl(p.url);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-red-600 bg-red-50 text-red-700 shadow-xs ring-1 ring-red-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-5 h-5 rounded-full object-cover border border-slate-300 shrink-0"
                />
                <span>{p.label}</span>
              </button>
            );
          })}

          {otherPresets.length > 0 && (
            otherPresets.slice(0, 4).map((p, idx) => (
              <button
                type="button"
                key={`other-${idx}`}
                onClick={() => {
                  onPhotoChange(p.url);
                  setCustomUrl(p.url);
                }}
                className="px-2 py-1 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <img
                  src={p.url}
                  alt={p.label}
                  className="w-4 h-4 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <span>{p.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
