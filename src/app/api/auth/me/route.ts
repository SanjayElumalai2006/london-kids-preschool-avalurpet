import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { UserModel } from '@/models';
import { getSessionUser } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No active session.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await UserModel.findOne({ id: session.userId }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found.' },
        { status: 404 }
      );
    }

    if (user.status === 'REMOVED' || user.status === 'INACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is not active.' },
        { status: 403 }
      );
    }

    const { password: _p, passwordHash: _ph, resetPasswordCode: _rc, _id, __v, ...safeUser } = user as any;

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Session verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify session.' },
      { status: 500 }
    );
  }
}
