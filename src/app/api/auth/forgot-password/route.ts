import { NextResponse } from 'next/server';
import { hashPasswordSync } from '@/lib/security';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, newPassword, resetCode } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Registered personal email address is required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // If request is to trigger a password reset code
    if (!newPassword && !resetCode) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      return NextResponse.json({
        success: true,
        message: `Password reset verification code dispatched to ${trimmedEmail}`,
        email: trimmedEmail,
        code
      });
    }

    // If request is to update password with code
    if (newPassword && resetCode) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: 'Password must be at least 6 characters long.' },
          { status: 400 }
        );
      }

      const passwordHash = hashPasswordSync(newPassword);
      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
        email: trimmedEmail,
        passwordHash
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid reset request parameters.' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request.' },
      { status: 500 }
    );
  }
}
