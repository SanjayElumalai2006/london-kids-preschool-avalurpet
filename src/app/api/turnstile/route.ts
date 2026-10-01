import { NextResponse } from 'next/server';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limiting: 20 challenge checks per 10 mins per IP
    const rateCheck = checkRateLimit(`turnstile:${clientIp}`, 20, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many verification attempts. Please wait.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token } = body;

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
      { success: false, error: err?.message || 'Internal server error during Turnstile verification.' },
      { status: 500 }
    );
  }
}
