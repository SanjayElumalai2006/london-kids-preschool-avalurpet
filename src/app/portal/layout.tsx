'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, LogOut, ShieldCheck, Menu, X, 
  GraduationCap, TrendingUp, Settings, BookOpen, Heart, UserPlus, ArrowRight
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { User, UserRole } from '@/types';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Strict session and role authorization check
  const verifySession = useCallback(() => {
    const store = getStore();
    const user = store.currentUser;

    if (!user) {
      setIsAuthorized(false);
      setCurrentUser(null);
      window.location.replace('/login');
      return false;
    }

    const role = user.role;
    let allowed = true;

    if (pathname.startsWith('/portal/principal') && !['PRINCIPAL', 'OWNER', 'ADMIN'].includes(role)) {
      allowed = false;
    } else if (pathname.startsWith('/portal/owner') && role !== 'OWNER' && role !== 'PRINCIPAL') {
      allowed = false;
    } else if (pathname.startsWith('/portal/admin') && role !== 'ADMIN' && role !== 'OWNER' && role !== 'PRINCIPAL') {
      allowed = false;
    } else if (pathname.startsWith('/portal/staff') && !['STAFF', 'TEACHER', 'ADMIN', 'OWNER', 'PRINCIPAL'].includes(role)) {
      allowed = false;
    } else if (pathname.startsWith('/portal/teacher') && !['TEACHER', 'STAFF', 'ADMIN', 'OWNER', 'PRINCIPAL'].includes(role)) {
      allowed = false;
    } else if (pathname.startsWith('/portal/parent') && !['PARENT', 'STUDENT', 'ADMIN', 'OWNER', 'PRINCIPAL'].includes(role)) {
      allowed = false;
    }

    if (!allowed) {
      if (role === 'OWNER') router.replace('/portal/owner');
      else if (role === 'PRINCIPAL') router.replace('/portal/principal');
      else if (role === 'ADMIN') router.replace('/portal/admin');
      else if (role === 'STAFF') router.replace('/portal/staff');
      else if (role === 'TEACHER') router.replace('/portal/teacher');
      else router.replace('/portal/parent');
      return false;
    }

    setCurrentUser(user);
    setIsAuthorized(true);
    return true;
  }, [pathname, router]);

  useEffect(() => {
    verifySession();

    const handleUpdate = () => {
      verifySession();
    };

    // BFCache (Back-Forward cache) and focus protection:
    // If user clicked browser Back or logged out in another tab, immediately re-verify session
    const handlePageShow = () => {
      verifySession();
    };

    window.addEventListener('preschool_store_updated', handleUpdate);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handlePageShow);

    return () => {
      window.removeEventListener('preschool_store_updated', handleUpdate);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handlePageShow);
    };
  }, [verifySession]);

  const handleLogout = () => {
    // 1. Clear current user from store
    saveStore({ currentUser: null });
    // 2. Clear any session storage
    try {
      sessionStorage.clear();
    } catch (e) {}
    // 3. Replace location so browser history does not navigate back to protected page
    window.location.replace('/login');
  };

  if (!isAuthorized || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="w-8 h-8 rounded-full border-3 border-red-600 border-t-transparent animate-spin"></span>
          <p className="font-extrabold text-slate-800 text-sm">Verifying Security Session...</p>
          <p className="text-xs text-slate-500">Redirecting to secure login if unauthenticated.</p>
        </div>
      </div>
    );
  }

  const roleColors: Record<UserRole, string> = {
    PARENT: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    STUDENT: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    TEACHER: 'bg-sky-100 text-sky-800 border-sky-300',
    STAFF: 'bg-teal-100 text-teal-800 border-teal-300',
    PRINCIPAL: 'bg-blue-100 text-blue-800 border-blue-300',
    ADMIN: 'bg-amber-100 text-amber-800 border-amber-300',
    OWNER: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const currentRole: UserRole = currentUser.role;

  // Navigation items for the sidebar
  const getNavLinks = () => {
    if (currentRole === 'PRINCIPAL') {
      return [
        { href: '/portal/principal', label: 'Principal Executive & Fees', icon: <TrendingUp size={18} /> },
        { href: '/portal/owner', label: 'Owner Financial Audit', icon: <GraduationCap size={18} /> },
        { href: '/portal/admin', label: 'Campus Admin & Ops', icon: <Settings size={18} /> },
        { href: '/portal/admin/users', label: 'Users Directory', icon: <Users size={18} /> },
        { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
      ];
    }
    if (currentRole === 'OWNER') {
      return [
        { href: '/portal/owner', label: 'Executive Overview', icon: <TrendingUp size={18} /> },
        { href: '/portal/principal', label: 'Principal Fee Analysis', icon: <GraduationCap size={18} /> },
        { href: '/portal/owner/users', label: 'Users Management', icon: <Users size={18} /> },
        { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
      ];
    }
    if (currentRole === 'ADMIN') {
      return [
        { href: '/portal/admin', label: 'Campus Operations', icon: <Settings size={18} /> },
        { href: '/portal/principal', label: 'Fee & Financial Audit', icon: <TrendingUp size={18} /> },
        { href: '/portal/admin/enrollment', label: 'User Enrollment', icon: <UserPlus size={18} /> },
        { href: '/portal/admin/users', label: 'Users Directory', icon: <Users size={18} /> },
        { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
      ];
    }
    if (currentRole === 'STAFF') {
      return [
        { href: '/portal/staff', label: 'Staff & Campus Ops', icon: <Users size={18} /> },
        { href: '/portal/teacher', label: 'Classroom & Attendance', icon: <BookOpen size={18} /> },
        { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
      ];
    }
    if (currentRole === 'TEACHER') {
      return [
        { href: '/portal/teacher', label: 'Classroom & Students', icon: <BookOpen size={18} /> },
        { href: '/portal/staff', label: 'Campus Support', icon: <Users size={18} /> },
        { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
      ];
    }
    return [
      { href: '/portal/parent', label: 'My Child Profile', icon: <Heart size={18} /> },
      { href: '/gallery', label: 'School Events Gallery', icon: <BookOpen size={18} /> },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100/80 text-slate-800 selection:bg-yellow-200">
      
      {/* ── MOBILE TOP BAR ────────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img
            src="/logo/logo.png"
            alt="London Kids Preschool Avalurpet"
            className="w-9 h-9 object-contain rounded-xl border border-yellow-300 p-0.5 bg-white shadow-2xs"
          />
          <div>
            <span className="font-black text-sm text-slate-900 leading-tight block">
              London<span className="text-red-600">Kids</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 block">
              {currentRole} Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Prominent Visible Logout Button for Mobile */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="Logout from portal"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── SIDEBAR (DESKTOP & MOBILE DRAWER) ─────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:h-screen md:sticky md:top-0 shadow-md md:shadow-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Sidebar Brand Header with logo.png */}
          <div className="flex items-center gap-3">
            <img
              src="/logo/logo.png"
              alt="London Kids Preschool Avalurpet"
              className="w-13 h-13 object-contain rounded-2xl border-2 border-yellow-400 p-1 bg-white shadow-sm shrink-0"
            />
            <div className="overflow-hidden">
              <span className="font-black text-base text-slate-900 leading-tight block tracking-tight">
                London<span className="text-red-600">Kids</span>
              </span>
              <span className="text-[11px] font-extrabold text-red-600 block leading-tight truncate">
                Preschool Avalurpet
              </span>
              <span className={`inline-block mt-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${roleColors[currentRole]}`}>
                {currentRole} Portal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2" aria-label="Portal Sidebar Navigation">
            <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-200'
                      : 'text-slate-600 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Shortcuts
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span>🌐</span>
              <span>Public Website</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer: Authenticated User Profile & Visible Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* User Profile Snippet */}
          <div className="flex items-center gap-2.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <img
              src={currentUser.avatar || currentUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={currentUser.name || 'User'}
              className="w-9 h-9 rounded-full object-cover border border-amber-300 shrink-0"
            />
            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-extrabold text-slate-800 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate leading-tight">{currentUser.personalEmail || currentUser.email}</p>
              <span className={`inline-block mt-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${roleColors[currentRole]}`}>
                {currentRole}
              </span>
            </div>
          </div>

          {/* Prominent Visible Logout Button for Sidebar */}
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:scale-[1.01] cursor-pointer"
            title="Sign out from your session"
          >
            <LogOut size={15} />
            <span>Sign Out / Logout</span>
          </button>

          {/* Tech Partner credit */}
          <div className="pt-1 text-center space-y-0.5">
            <p className="text-[10px] text-slate-400 font-medium">
              Platform by <span className="font-bold text-slate-700">7hills web solution</span>
            </p>
            <p className="text-[9px] text-slate-400">
              Support: <a href="tel:9500118875" className="font-bold text-slate-600 hover:text-red-600 hover:underline">9500118875</a>
            </p>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar with prominent Logout button in every portal */}
        <header className="hidden md:flex bg-white border-b border-slate-200 px-6 py-3.5 justify-between items-center sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Active Session:</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-lg border ${roleColors[currentRole]}`}>
              {currentRole}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-700 truncate max-w-xs">{currentUser.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Public Website ↗
            </Link>
            {/* Desktop Top Bar Visible Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
              title="Logout from portal"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
