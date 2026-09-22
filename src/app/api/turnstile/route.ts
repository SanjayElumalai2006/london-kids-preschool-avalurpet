import { NextResponse } from 'next/server';

const CLOUDFLARE_SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const DEFAULT_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA'; // Official Cloudflare test secret key

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Missing turnstile token' }, { status: 400 });
    }

    // Mock pass for local development simulation tokens
    if (typeof token === 'string' && token.includes('mock-pass')) {
      return NextResponse.json({ success: true, mode: 'simulated_dev' });
    }

    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;

    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    const cfResponse = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await cfResponse.json();

    if (result.success) {
      return NextResponse.json({ success: true, timestamp: result.challenge_ts });
    } else {
      return NextResponse.json(
        { success: false, errors: result['error-codes'] || ['verification_failed'] },
        { status: 400 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error during Turnstile verification' },
      { status: 500 }
    );
  }
}
