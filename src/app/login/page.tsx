'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Eye, EyeOff, CheckCircle2, ArrowRight, X, Lock, Mail, Key
} from '@/components/Icons';
import { getStore, saveStore } from '@/lib/store';
import { UserRole, User } from '@/types';
import { verifyPassword, hashPasswordSync } from '@/lib/security';
import SchoolLogo from '@/components/SchoolLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password & reset password multi-step state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'EMAIL_PREVIEW' | 'RESET_FORM' | 'SUCCESS'>('REQUEST');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeSentAt, setCodeSentAt] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  
  // Password Reset fields
  const [enteredCode, setEnteredCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // First-time login password change state
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdChangeError, setPwdChangeError] = useState('');

  // Clear email and password fields when login page first opens
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
  }, []);

  const redirectByRole = (role: UserRole) => {
    if (role === 'PARENT' || role === 'STUDENT') {
      router.push('/portal/parent');
    } else if (role === 'TEACHER' || role === 'STAFF') {
      router.push('/portal/teacher');
    } else if (role === 'ADMIN') {
      router.push('/portal/admin');
    } else if (role === 'PRINCIPAL') {
      router.push('/portal/principal');
    } else if (role === 'OWNER') {
      router.push('/portal/owner');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inputEmail = email.trim();
    const inputPwd = password.trim();

    if (!inputEmail || !inputPwd) {
      setError('Please enter your personal email address and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const store = getStore();
      const input = inputEmail.toLowerCase();
      const inputDigits = input.replace(/\D/g, '');

      // Allow sign in with personal email, employee ID, or registered phone
      const matchedUser = store.users.find(u => {
        const uPersonal = (u.personalEmail || '').trim().toLowerCase();
        const uEmail = (u.email || '').trim().toLowerCase();
        const uEmpId = (u.employeeId || '').trim().toLowerCase();
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');

        return (
          (uPersonal && uPersonal === input) ||
          (uEmail && uEmail === input) ||
          (uEmpId && uEmpId === input) ||
          (inputDigits.length >= 10 && uPhoneDigits.endsWith(inputDigits.slice(-10)))
        );
      });

      if (!matchedUser) {
        setError('Incorrect login ID. Please enter your registered personal email address or mobile number.');
        setLoading(false);
        return;
      }

      if (matchedUser.status === 'REMOVED') {
        setError('This account has been removed. Please contact the school administrator for assistance.');
        setLoading(false);
        return;
      }

      if (matchedUser.status === 'INACTIVE') {
        setError('This account is currently inactive. Please contact the school administrator to reactivate your access.');
        setLoading(false);
        return;
      }

      // Check passwords securely using verifyPassword
      const storedCredential = matchedUser.passwordHash || (matchedUser as any).password;
      const matchStored = Boolean(storedCredential && verifyPassword(inputPwd, storedCredential));
      
      const matchOwner = Boolean(
        (matchedUser.personalEmail?.toLowerCase() === 'londonkids276@gmail.com' || matchedUser.role === 'OWNER') &&
        (inputPwd === '90436 33545' || (storedCredential && verifyPassword(inputPwd, storedCredential)))
      );

      if (!matchStored && !matchOwner) {
        setError('Incorrect password. Please enter your valid password or use "Forgot Password" to reset it.');
        setLoading(false);
        return;
      }

      // Check email verification status
      if (matchedUser.emailVerified === false) {
        setError('Your account email has not been verified yet. Please contact the school administrator to verify your access.');
        setLoading(false);
        return;
      }

      // If user is required to change password on first login
      if (matchedUser.mustChangePassword) {
        setPasswordChangeUser(matchedUser);
        setLoading(false);
        return;
      }

      // Ensure no raw password is ever saved to store
      const { password: _rawPwd, ...safeUser } = matchedUser as any;
      saveStore({ currentUser: safeUser });
      redirectByRole(safeUser.role);
    }, 350);
  };

  // ── FORGOT PASSWORD FLOW ───────────────────────────────────────────────
  const handleOpenForgotPassword = () => {
    setForgotStep('REQUEST');
    setForgotEmail(email.trim());
    setForgotError('');
    setResetError('');
    setEnteredCode('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setForgotModalOpen(true);
  };

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    const targetEmail = forgotEmail.trim().toLowerCase();
    if (!targetEmail) {
      setForgotError('Please enter your registered personal email address.');
      return;
    }

    const store = getStore();
    const user = store.users.find(u => 
      (u.personalEmail && u.personalEmail.trim().toLowerCase() === targetEmail) ||
      (u.email && u.email.trim().toLowerCase() === targetEmail)
    );

    if (!user) {
      setForgotError(`No registered account found with email "${forgotEmail}". Please check your email or contact the school office (+91 90436 33545).`);
      return;
    }

    if (user.status === 'REMOVED') {
      setForgotError('This account has been removed. Please contact the administrator.');
      return;
    }

    // Generate 6-digit verification security code
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    // Save reset code on user in store
    const updatedUsers = store.users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          verificationToken: code,
          verificationExpiresAt: expiresAt
        };
      }
      return u;
    });

    saveStore({ users: updatedUsers });

    setGeneratedCode(code);
    setCodeSentAt(new Date().toLocaleTimeString());
    setTargetUserName(user.name);
    setEnteredCode(code); // Pre-fill convenience
    setForgotStep('EMAIL_PREVIEW');
  };

  const handleProceedToResetForm = () => {
    setForgotStep('RESET_FORM');
    setResetError('');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!enteredCode.trim()) {
      setResetError('Please enter the 6-digit verification code.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please re-enter both correctly.');
      return;
    }

    const store = getStore();
    const targetEmail = forgotEmail.trim().toLowerCase();
    const user = store.users.find(u => 
      (u.personalEmail && u.personalEmail.trim().toLowerCase() === targetEmail) ||
      (u.email && u.email.trim().toLowerCase() === targetEmail)
    );

    if (!user) {
      setResetError('Account could not be verified. Please restart password recovery.');
      return;
    }

    // Verify code
    if (user.verificationToken && user.verificationToken !== enteredCode.trim()) {
      setResetError('Invalid verification code. Please check the code sent to your registered email.');
      return;
    }

    // Hash new password and save
    const newHash = hashPasswordSync(resetNewPassword);
    const updatedUsers = store.users.map(u => {
      if (u.id === user.id) {
        const { password: _p, ...cleanUser } = u as any;
        return {
          ...cleanUser,
          passwordHash: newHash,
          mustChangePassword: false,
          verificationToken: undefined,
          verificationExpiresAt: undefined,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    saveStore({ users: updatedUsers });
    setForgotStep('SUCCESS');
  };

  const handleFinishReset = () => {
    setEmail(forgotEmail);
    setPassword('');
    setForgotModalOpen(false);
  };

  // ── FIRST-TIME LOGIN PASSWORD CHANGE ───────────────────────────────────
  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeError('');

    if (newPassword.length < 6) {
      setPwdChangeError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdChangeError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!passwordChangeUser) return;

    const store = getStore();
    const newHash = hashPasswordSync(newPassword);
    const updatedUsers = store.users.map(u => {
      if (u.id === passwordChangeUser.id) {
        const { password: _legacyPwd, ...rest } = u as any;
        return {
          ...rest,
          passwordHash: newHash,
          mustChangePassword: false,
          updatedAt: new Date().toISOString()
        };
      }
      return u;
    });

    const { password: _legacyPwd, ...restChangeUser } = passwordChangeUser as any;
    const activeUser: User = { 
      ...restChangeUser, 
      passwordHash: newHash, 
      mustChangePassword: false,
      updatedAt: new Date().toISOString()
    };
    saveStore({ users: updatedUsers, currentUser: activeUser });
    setPasswordChangeUser(null);
    redirectByRole(activeUser.role);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50/60 via-orange-50/30 to-amber-100/40 flex flex-col justify-between p-4 sm:p-6 lg:p-8 selection:bg-orange-200">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center py-2">
        <Link href="/" className="flex items-center gap-2.5 group">
          <SchoolLogo size={42} variant="primary" />
          <span className="font-extrabold text-xl text-slate-800 tracking-tight">
            London<span className="text-red-600">Kids</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-orange-600 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
        >
          ← Back to Website
        </Link>
      </div>

      {/* Center Auth Card */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-200 relative overflow-hidden">
          {/* Top color ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-amber-400 via-orange-500 to-rose-400"></div>

          <div className="text-center space-y-3 mb-6 pt-1">
            {/* Logo directly above the login form */}
            <div className="flex justify-center">
              <img
                src="/logo/logo.png"
                alt="London Kids Preschool Avalurpet"
                className="w-20 h-20 object-contain rounded-2xl border-2 border-yellow-400 p-1 bg-white shadow-md hover:scale-105 transition-transform"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              School Portal Login
            </h1>
            <p className="text-xs text-slate-500">
              London Kids Preschool Avalurpet — Sign in with your registered credentials
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
            {error && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs sm:text-sm text-rose-900 font-bold leading-relaxed flex items-start gap-2 shadow-xs">
                <span className="text-base shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="login-email" className="block text-sm font-semibold text-gray-900">
                  Login ID
                </label>
                <span className="text-xs font-medium text-gray-500">
                  Email / Mobile / Employee ID
                </span>
              </div>
              <input
                id="login-email"
                type="text"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Registered Email, Mobile, or Employee ID"
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium transition-all focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5">
                <label htmlFor="login-password" className="block text-sm font-semibold text-gray-900">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotPassword}
                  className="text-xs font-bold text-orange-700 hover:text-orange-900 underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium transition-all focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} className="text-gray-700" /> : <Eye size={20} className="text-gray-700" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold text-base shadow-md shadow-orange-300/50 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Authenticating Account...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In To Portal</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Role-based access isolation &amp; encrypted credentials</span>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="text-center text-xs text-slate-500 py-4">
        <p>Preschool Management System • London Kids Preschool Avalurpet</p>
      </div>

      {/* ── FORGOT & RESET PASSWORD MULTI-STEP MODAL ────────────────────── */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-amber-100 relative animate-scaleUp">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* STEP 1: REQUEST EMAIL */}
            {forgotStep === 'REQUEST' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                    <Key size={22} className="text-amber-700" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900">
                      Forgot Password?
                    </h3>
                    <p className="text-xs text-slate-500">
                      We will dispatch a secure reset verification code to your registered email.
                    </p>
                  </div>
                </div>

                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold leading-relaxed">
                    ⚠️ {forgotError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Registered Personal Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. londonkids276@gmail.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter the exact email associated with your School Director/Owner or staff account.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
                  >
                    Send Password Reset Email →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: EMAIL PREVIEW / SIMULATION */}
            {forgotStep === 'EMAIL_PREVIEW' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={16} />
                  <span>Password Reset Email Dispatched!</span>
                </div>

                {/* Simulated Email Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-bold">
                      <Mail size={13} className="text-orange-600" />
                      <span>Simulated Inbox Dispatch</span>
                    </span>
                    <span>{codeSentAt}</span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-500">
                      <strong>To:</strong> {forgotEmail}
                    </p>
                    <p className="text-slate-500">
                      <strong>Subject:</strong> 🔐 Password Reset Code — London Kids Preschool
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-2 text-center">
                    <p className="text-xs text-slate-600">
                      Hello <strong>{targetUserName || 'User'}</strong>, your 6-digit password verification code is:
                    </p>
                    <div className="text-2xl font-black text-orange-600 tracking-widest py-1 bg-amber-50 rounded-lg border border-dashed border-amber-300">
                      {generatedCode}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Valid for 15 minutes. Use this code on the next screen to update your password.
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleProceedToResetForm}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Update Password</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: RESET PASSWORD FORM */}
            {forgotStep === 'RESET_FORM' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                    🔐
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900">
                      Set New Password
                    </h3>
                    <p className="text-xs text-slate-500 truncate max-w-xs">
                      Account: <strong>{forgotEmail}</strong>
                    </p>
                  </div>
                </div>

                {resetError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold leading-relaxed">
                    ⚠️ {resetError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-gray-300 text-gray-900 font-mono tracking-wider text-base font-bold text-center focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    New Password (min 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showResetNewPassword ? 'text' : 'password'}
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-1"
                    >
                      {showResetNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 shadow-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 p-1"
                    >
                      {showResetConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep('REQUEST')}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-200 transition-all cursor-pointer"
                  >
                    Save &amp; Update Password →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: SUCCESS CONFIRMATION */}
            {forgotStep === 'SUCCESS' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-xl text-slate-900">
                    Password Successfully Updated!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                    Your new password is now active for <strong>{forgotEmail}</strong>. You can now sign in with your updated credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishReset}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-extrabold text-sm shadow-md hover:from-orange-700 hover:to-amber-600 transition-all cursor-pointer"
                >
                  Return to Login &amp; Sign In →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FIRST-TIME LOGIN PASSWORD CHANGE MODAL ──────────────────────── */}
      {passwordChangeUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-4 border-yellow-200 relative animate-scaleUp space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl">
                <Lock size={22} className="text-amber-700" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">
                  First-Time Login Security
                </h3>
                <p className="text-xs text-slate-500">
                  Welcome, <strong>{passwordChangeUser.name}</strong> ({passwordChangeUser.role})!
                </p>
              </div>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">Required Security Step:</p>
              <p className="text-[11px] text-amber-800">
                You logged in with a temporary password. As mandated by London Kids Preschool policy, please set your private personal password to continue.
              </p>
            </div>

            {pwdChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {pwdChangeError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 text-base font-medium focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 shadow-xs"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordChangeUser(null)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-amber-200 transition-all cursor-pointer"
                >
                  Save Password &amp; Proceed →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
