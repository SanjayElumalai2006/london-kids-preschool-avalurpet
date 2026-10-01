import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, AuditLogModel } from '@/models';
import { verifyPassword, hashPasswordSync, needsRehash } from '@/lib/security';
import { createSessionToken, getSessionCookieHeader } from '@/lib/session';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rateLimit';
import { DEMO_USERS } from '@/lib/initialData';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // 1. Rate Limiting: 10 attempts per 15 mins (50 for localhost/dev)
    const maxAttempts = (process.env.NODE_ENV !== 'production' || clientIp === '127.0.0.1' || clientIp === '::1') ? 50 : 10;
    const rateCheck = checkRateLimit(`login:${clientIp}`, maxAttempts, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please wait ${rateCheck.resetInSec} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const rawIdentifier = body.identifier || body.email || body.phone;
    const password = body.password;

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered email/phone and password.' },
        { status: 400 }
      );
    }

    const cleanInput = String(rawIdentifier).trim().toLowerCase();
    const cleanPwd = String(password).trim();
    const inputDigits = cleanInput.replace(/\D/g, '');

    await connectToDatabase();

    // 2. Locate User in MongoDB
    let user = await UserModel.findOne({
      $or: [
        { personalEmail: cleanInput },
        { email: cleanInput },
        { employeeId: cleanInput },
      ],
    }).lean();

    // Support phone number search if 10+ digits provided
    if (!user && inputDigits.length >= 10) {
      const allUsers = await UserModel.find({}).lean();
      user = allUsers.find((u: any) => {
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
        return uPhoneDigits.endsWith(inputDigits.slice(-10));
      }) as any;
    }

    // Fallback to DEMO_USERS if DB collection is completely empty
    if (!user) {
      const count = await UserModel.countDocuments();
      if (count === 0) {
        user = DEMO_USERS.find((u: any) => {
          const uPersonal = (u.personalEmail || '').toLowerCase();
          const uEmail = (u.email || '').toLowerCase();
          const uEmpId = (u.employeeId || '').toLowerCase();
          const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
          return (
            uPersonal === cleanInput ||
            uEmail === cleanInput ||
            uEmpId === cleanInput ||
            (inputDigits.length >= 10 && uPhoneDigits.endsWith(inputDigits.slice(-10)))
          );
        }) as any;

        // Auto-seed demo users
        if (user) {
          await UserModel.insertMany(DEMO_USERS).catch(() => {});
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Incorrect login ID. Please enter your registered personal email address or mobile number.' },
        { status: 401 }
      );
    }

    if (user.status === 'REMOVED') {
      return NextResponse.json(
        { success: false, error: 'This account has been removed. Please contact the school administrator for assistance.' },
        { status: 403 }
      );
    }

    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        { success: false, error: 'This account is currently inactive. Please contact the school administrator to reactivate your access.' },
        { status: 403 }
      );
    }

    // 3. Password Verification
    const storedCredential = (user as any).passwordHash || (user as any).password;
    const isValid = verifyPassword(cleanPwd, storedCredential);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please enter your valid password or use "Forgot Password" to reset it.' },
        { status: 401 }
      );
    }

    // 4. Automatic Password Hash Migration to Bcrypt
    if (needsRehash(storedCredential)) {
      try {
        const upgradedBcryptHash = hashPasswordSync(cleanPwd);
        await UserModel.updateOne(
          { id: user.id },
          { $set: { passwordHash: upgradedBcryptHash } }
        );
      } catch (err) {
        console.warn('Failed to auto-upgrade legacy password hash:', err);
      }
    }

    // 5. Update Last Login Timestamp
    try {
      await UserModel.updateOne(
        { id: user.id },
        { $set: { lastLogin: new Date().toISOString() } }
      );
    } catch {}

    // 6. Generate Session Token & Cookie
    resetRateLimit(`login:${clientIp}`);
    const sessionToken = createSessionToken(user as any);
    const cookieHeader = getSessionCookieHeader(sessionToken);

    // 7. Sanitize User Record (Never expose passwords or reset codes)
    const { password: _p, passwordHash: _ph, resetPasswordCode: _rc, _id, __v, ...safeUser } = user as any;

    // 8. Safe Audit Log (No credentials logged)
    try {
      await AuditLogModel.create({
        id: `aud-${Date.now()}`,
        action: 'USER_LOGIN',
        targetUserId: user.id,
        targetUserName: user.name,
        targetUserRole: user.role,
        performedBy: user.id,
        performedByName: user.name,
        details: `Successful login by ${user.role} (${user.name}) from ${clientIp}`,
        timestamp: new Date().toISOString(),
      });
    } catch {}

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: safeUser,
      token: sessionToken,
    });

    response.headers.set('Set-Cookie', cookieHeader);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
