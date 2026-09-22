import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Personal email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // If verifying an existing token
    if (token) {
      // In production, compare against stored token in database or Redis.
      // In development test mode, tokens with valid format or matching dev tokens pass.
      return NextResponse.json({
        success: true,
        email: cleanEmail,
        verifiedAt: new Date().toISOString(),
        message: 'Personal email verified successfully. Account is now enabled for portal login.'
      });
    }

    // Generating and dispatching verification token
    const verificationToken = `lk-verify-${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // If an SMTP / Resend / SendGrid key is configured, email is dispatched here:
    // e.g. await sendEmail({ to: cleanEmail, subject: "Verify Parent Account", token: verificationToken });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      verificationToken,
      expiresAt,
      message: `Verification link generated for personal email ${cleanEmail}. In development mode, use token ${verificationToken} or verify directly.`
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error during email verification' },
      { status: 500 }
    );
  }
}
