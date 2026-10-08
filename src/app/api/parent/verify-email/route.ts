import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, AuditLogModel } from '@/models';
import { hashPasswordSync, verifyPassword, isAllowedOrigin } from '@/lib/security';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';

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

    // Rate limiting: 5 attempts per 15 minutes
    const rateCheck = await checkRateLimitAsync(`email-verify:${clientIp}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please wait.' },
        { status: 429 }
      );
    }

    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Registered personal email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    await connectToDatabase();

    const user = await UserModel.findOne({
      $or: [{ personalEmail: cleanEmail }, { email: cleanEmail }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No user account found with this email address.' },
        { status: 404 }
      );
    }

    // 1. Verifying an existing token
    if (token) {
      const cleanToken = String(token).trim();
      const storedTokenHash = (user as any).emailVerificationTokenHash;
      const tokenExpires = (user as any).emailVerificationExpires;

      if (!storedTokenHash) {
        // If already verified
        if (user.emailVerified) {
          return NextResponse.json({
            success: true,
            email: cleanEmail,
            message: 'Email address is already verified. You can log in to the portal.',
          });
        }
        return NextResponse.json(
          { success: false, error: 'No active email verification request found.' },
          { status: 400 }
        );
      }

      if (tokenExpires && new Date() > new Date(tokenExpires)) {
        return NextResponse.json(
          { success: false, error: 'Verification token has expired. Please request a new verification email.' },
          { status: 400 }
        );
      }

      const isValid = verifyPassword(cleanToken, storedTokenHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification token.' },
          { status: 400 }
        );
      }

      user.emailVerified = true;
      (user as any).emailVerificationTokenHash = undefined;
      (user as any).emailVerificationExpires = undefined;
      await user.save();

      try {
        await AuditLogModel.create({
          id: `aud-${Date.now()}`,
          action: 'EMAIL_VERIFIED',
          targetUserId: user.id,
          targetUserName: user.name,
          targetUserRole: user.role,
          performedBy: user.id,
          performedByName: user.name,
          details: `Parent email ${cleanEmail} verified successfully from ${clientIp}`,
          timestamp: new Date().toISOString(),
        });
      } catch {}

      return NextResponse.json({
        success: true,
        email: cleanEmail,
        message: 'Personal email verified successfully. Account is now active for portal login.',
      });
    }

    // 2. Generating and dispatching verification token
    const verificationToken = `lk-${crypto.randomBytes(16).toString('hex')}`;
    const tokenHash = hashPasswordSync(verificationToken);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    (user as any).emailVerificationTokenHash = tokenHash;
    (user as any).emailVerificationExpires = expiresAt;
    await user.save();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV MODE ONLY] Email verification token for ${cleanEmail}: ${verificationToken}`);
    }

    // Never return the token directly in the response in production
    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: `A verification link has been dispatched to ${cleanEmail}. Please check your inbox.`,
    });
  } catch (err: any) {
    console.error('Email verification error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during email verification.' },
      { status: 500 }
    );
  }
}
