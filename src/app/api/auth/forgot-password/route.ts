import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, AuditLogModel } from '@/models';
import { hashPasswordSync, verifyPassword, isAllowedOrigin } from '@/lib/security';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';
import { DEMO_USERS } from '@/lib/initialData';

export async function POST(request: Request) {
  try {
    // 0. CSRF & Origin Allowlist Check
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Untrusted request origin.' },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);

    // 1. Distributed Rate Limiting: 5 requests per 15 minutes per IP
    const rateCheck = await checkRateLimitAsync(`forgot-pwd:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many password reset attempts. Please wait ${rateCheck.resetInSec} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, newPassword, resetCode } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Registered personal email address is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    let isDbConnected = false;
    let user: any = null;

    try {
      await connectToDatabase();
      isDbConnected = true;
      user = await UserModel.findOne({
        $or: [
          { personalEmail: trimmedEmail },
          { email: trimmedEmail },
        ],
      });
    } catch {
      console.warn('Database offline or unconfigured on Vercel; checking built-in accounts.');
    }

    if (!user) {
      user = DEMO_USERS.find(
        (u: any) =>
          (u.personalEmail && u.personalEmail.toLowerCase() === trimmedEmail) ||
          (u.email && u.email.toLowerCase() === trimmedEmail)
      );
    }

    // 2. Stage 1: Requesting a Password Reset Code
    if (!newPassword && !resetCode) {
      if (!user) {
        // Return generic message to prevent email enumeration attacks
        return NextResponse.json({
          success: true,
          message: 'If the provided email is registered with London Kids Preschool, a 6-digit verification code has been dispatched.',
        });
      }

      if (user.status === 'REMOVED' || user.status === 'INACTIVE') {
        return NextResponse.json(
          { success: false, error: 'This account is currently inactive. Please contact the school office.' },
          { status: 403 }
        );
      }

      // Generate cryptographically secure 6-digit code
      const code = String(crypto.randomInt(100000, 1000000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      // Store hashed reset code in database
      const hashedCode = hashPasswordSync(code);
      user.resetPasswordCode = hashedCode;
      (user as any).resetCodeExpires = expiresAt;
      await user.save();

      // Log audit event (safe, no code)
      try {
        await AuditLogModel.create({
          id: `aud-${Date.now()}`,
          action: 'PASSWORD_RESET_REQUESTED',
          targetUserId: user.id,
          targetUserName: user.name,
          targetUserRole: user.role,
          performedBy: user.id,
          performedByName: user.name,
          details: `Password reset verification code requested for ${trimmedEmail} from ${clientIp}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      // If running locally in development without an active SMTP server, print code safely in server logs
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV MODE ONLY] Password reset code for ${trimmedEmail}: ${code}`);
      }

      // Never return the reset code in the response body!
      return NextResponse.json({
        success: true,
        message: 'If the provided email is registered with London Kids Preschool, a 6-digit verification code has been dispatched.',
      });
    }

    // 3. Stage 2: Confirming Code & Setting New Password
    if (newPassword && resetCode) {
      const cleanCode = String(resetCode).trim();
      const cleanNewPassword = String(newPassword).trim();

      if (cleanNewPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'New password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      if (!user || !user.resetPasswordCode) {
        return NextResponse.json(
          { success: false, error: 'No active password reset request found for this account.' },
          { status: 400 }
        );
      }

      // Check code expiration
      const expiresAt = (user as any).resetCodeExpires;
      if (expiresAt && new Date() > new Date(expiresAt)) {
        user.resetPasswordCode = undefined;
        (user as any).resetCodeExpires = undefined;
        await user.save();
        return NextResponse.json(
          { success: false, error: 'Password reset code has expired. Please request a new code.' },
          { status: 400 }
        );
      }

      // Verify reset code
      const isCodeValid = verifyPassword(cleanCode, user.resetPasswordCode);
      if (!isCodeValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code. Please check your email and try again.' },
          { status: 400 }
        );
      }

      // Hash new password using bcrypt
      const newHash = hashPasswordSync(cleanNewPassword);
      user.passwordHash = newHash;
      user.mustChangePassword = false;
      user.resetPasswordCode = undefined;
      (user as any).resetCodeExpires = undefined;
      await user.save();

      // Audit log
      try {
        await AuditLogModel.create({
          id: `aud-${Date.now()}`,
          action: 'PASSWORD_RESET_COMPLETED',
          targetUserId: user.id,
          targetUserName: user.name,
          targetUserRole: user.role,
          performedBy: user.id,
          performedByName: user.name,
          details: `Password reset successfully completed for ${trimmedEmail} from ${clientIp}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      // Never return passwordHash in the response!
      return NextResponse.json({
        success: true,
        message: 'Password reset completed successfully. You can now log in with your new password.',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password reset parameters.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred while processing password reset.' },
      { status: 500 }
    );
  }
}
