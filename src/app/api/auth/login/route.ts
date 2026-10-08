import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel, StudentModel, AuditLogModel } from '@/models';
import { verifyPassword, hashPasswordSync, needsRehash, isAllowedOrigin } from '@/lib/security';
import { createSessionToken, getSessionCookieHeader } from '@/lib/session';
import { checkRateLimitAsync, resetRateLimit, getClientIp } from '@/lib/rateLimit';
import { DEMO_USERS, DEMO_STUDENTS } from '@/lib/initialData';

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

    // 1. Distributed Rate Limiting: 10 attempts per 15 mins (50 for localhost/dev)
    const maxAttempts = (process.env.NODE_ENV !== 'production' || clientIp === '127.0.0.1' || clientIp === '::1') ? 50 : 10;
    const rateCheck = await checkRateLimitAsync(`login:${clientIp}`, maxAttempts, 15 * 60 * 1000);
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
    const rawIdentifier = body.identifier || body.emailOrPhone || body.email || body.phone || body.admissionId || body.staffId;
    const password = body.password;

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered ID/email/phone and password.' },
        { status: 400 }
      );
    }

    const cleanInput = String(rawIdentifier).trim().toLowerCase();
    const cleanPwd = String(password).trim();
    const inputDigits = cleanInput.replace(/\D/g, '');

    let user: any = null;
    let isDbConnected = false;

    try {
      await connectToDatabase();
      isDbConnected = true;
    } catch (dbErr) {
      console.warn('MongoDB connection deferred or unconfigured on Vercel. Falling back to built-in authorized store.');
    }

    if (isDbConnected) {
      // Escape regex special characters for safe case-insensitive matching
      const safeEscaped = cleanInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const caseInsensitiveRegex = new RegExp(`^${safeEscaped}$`, 'i');

      // 2. Locate User in MongoDB:
      // Check personalEmail, email, employeeId, staffId, admissionId, or user id
      user = await UserModel.findOne({
        $or: [
          { personalEmail: caseInsensitiveRegex },
          { email: caseInsensitiveRegex },
          { employeeId: caseInsensitiveRegex },
          { staffId: caseInsensitiveRegex },
          { admissionId: caseInsensitiveRegex },
          { id: caseInsensitiveRegex },
        ],
      }).lean();

      // If not matched directly on User, check if the identifier is a Student Admission Number or Student ID
      if (!user) {
        const student = await StudentModel.findOne({
          $or: [
            { admissionNo: caseInsensitiveRegex },
            { id: caseInsensitiveRegex },
          ],
        }).lean();

        if (student) {
          // Resolve linked parent/student user
          const parentSearch: any[] = [];
          if (student.parentId) parentSearch.push({ id: student.parentId });
          if (student.id) {
            parentSearch.push({ studentIds: student.id });
            parentSearch.push({ studentId: student.id });
          }
          if (student.parentEmail) {
            const safeEmail = student.parentEmail.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            parentSearch.push({ personalEmail: new RegExp(`^${safeEmail}$`, 'i') });
            parentSearch.push({ email: new RegExp(`^${safeEmail}$`, 'i') });
          }
          if (student.parentPhone) {
            const parentDigits = student.parentPhone.replace(/\D/g, '');
            if (parentDigits.length >= 10) {
              parentSearch.push({ phone: new RegExp(parentDigits.slice(-10)) });
            }
          }

          if (parentSearch.length > 0) {
            user = await UserModel.findOne({ $or: parentSearch }).lean();
          }
        }
      }

      // Support phone number search if 10+ digits provided
      if (!user && inputDigits.length >= 10) {
        const allUsers = await UserModel.find({}).lean();
        user = allUsers.find((u: any) => {
          const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
          return uPhoneDigits.endsWith(inputDigits.slice(-10));
        }) as any;
      }
    }

    // Fallback to DEMO_USERS and DEMO_STUDENTS if DB collection is empty or DB is offline
    if (!user) {
      const demoStudent = DEMO_STUDENTS.find((s: any) =>
        (s.admissionNo && s.admissionNo.toLowerCase() === cleanInput) ||
        (s.id && s.id.toLowerCase() === cleanInput)
      );

      user = DEMO_USERS.find((u: any) => {
        const uPersonal = (u.personalEmail || '').toLowerCase();
        const uEmail = (u.email || '').toLowerCase();
        const uEmpId = (u.employeeId || '').toLowerCase();
        const uStaffId = ((u as any).staffId || '').toLowerCase();
        const uAdmId = ((u as any).admissionId || '').toLowerCase();
        const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
        const matchesStudent = demoStudent && (
          u.id === demoStudent.parentId ||
          (u.studentIds && u.studentIds.includes(demoStudent.id)) ||
          (u.personalEmail && demoStudent.parentEmail && u.personalEmail.toLowerCase() === demoStudent.parentEmail.toLowerCase())
        );
        return (
          uPersonal === cleanInput ||
          uEmail === cleanInput ||
          uEmpId === cleanInput ||
          uStaffId === cleanInput ||
          uAdmId === cleanInput ||
          matchesStudent ||
          (inputDigits.length >= 10 && uPhoneDigits.endsWith(inputDigits.slice(-10)))
        );
      }) as any;

      // Auto-seed demo users if DB is connected but empty
      if (isDbConnected && user) {
        const count = await UserModel.countDocuments().catch(() => 1);
        if (count === 0) {
          await UserModel.insertMany(DEMO_USERS).catch(() => {});
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Incorrect login ID. Please enter your valid Staff ID, Student Admission No, or registered Email/Mobile.' },
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
    if (isDbConnected && needsRehash(storedCredential)) {
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
    if (isDbConnected) {
      try {
        await UserModel.updateOne(
          { id: user.id },
          { $set: { lastLogin: new Date().toISOString() } }
        );
      } catch {}
    }

    // 6. Generate Session Token & Cookie
    await resetRateLimit(`login:${clientIp}`);
    const isAdmin = ['OWNER', 'ADMIN', 'PRINCIPAL'].includes(user.role);
    const sessionToken = createSessionToken(user as any);
    const cookieHeader = getSessionCookieHeader(sessionToken, isAdmin);

    // 7. Sanitize User Record (Never expose passwords or reset codes)
    const { password: _p, passwordHash: _ph, resetPasswordCode: _rc, _id, __v, ...safeUser } = user as any;

    // 8. Safe Audit Log (No credentials logged)
    if (isDbConnected) {
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
    }

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
