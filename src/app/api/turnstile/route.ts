import { NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimitAsync, getClientIp } from '@/lib/rateLimit';
import { isAllowedOrigin } from '@/lib/security';

export async function POST(request: Request) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        { success: false, error: 'Cross-origin request rejected' },
        { status: 403 }
      );
    }

    const clientIp = getClientIp(request);

    // Rate limiting: 20 challenge checks per 10 mins per IP (distributed with fallback)
    const rateCheck = await checkRateLimitAsync(`turnstile:${clientIp}`, 20, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please wait.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== 'string' || token.length > 2048) {
      return NextResponse.json(
        { success: false, error: 'Valid verification token is required.' },
        { status: 400 }
      );
    }

    const result = await verifyTurnstileToken(token, clientIp);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Security challenge passed successfully.',
      });
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Turnstile verification failed.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error during verification.' },
      { status: 500 }
    );
  }
}
