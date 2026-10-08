import { NextResponse } from 'next/server';
import { getClearSessionCookieHeader, getRawSessionToken, revokeSessionToken, getSessionUser } from '@/lib/session';
import { AuditLogModel } from '@/models';

export async function POST(request: Request) {
  // 1. Invalidate session token server-side
  const rawToken = getRawSessionToken(request);
  const sessionUser = getSessionUser(request);

  if (rawToken) {
    revokeSessionToken(rawToken);
  }

  // 2. Safe audit log
  if (sessionUser) {
    try {
      await AuditLogModel.create({
        id: `aud-${Date.now()}`,
        action: 'USER_LOGOUT',
        targetUserId: sessionUser.userId,
        targetUserName: sessionUser.name,
        targetUserRole: sessionUser.role,
        performedBy: sessionUser.userId,
        performedByName: sessionUser.name,
        details: `User logout completed for ${sessionUser.role} (${sessionUser.name})`,
        timestamp: new Date().toISOString(),
      });
    } catch {}
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });

  response.headers.set('Set-Cookie', getClearSessionCookieHeader());
  return response;
}
