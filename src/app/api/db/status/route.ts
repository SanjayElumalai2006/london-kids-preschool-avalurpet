import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';

export async function GET() {
  try {
    await connectToDatabase();
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          status: 'DISCONNECTED',
          message: 'Database connection is not ready.',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    const host = mongoose.connection.host || 'localhost';
    const isLocal = host.includes('127.0.0.1') || host.includes('localhost');
    const isAtlas = host.includes('mongodb.net') || Boolean(process.env.MONGODB_URI?.includes('mongodb+srv'));

    // Safe operational summary without revealing connection credentials or URIs
    return NextResponse.json({
      success: true,
      status: 'CONNECTED',
      environment: process.env.NODE_ENV || 'development',
      provider: isAtlas ? 'MongoDB Atlas (Cloud)' : isLocal ? 'Local MongoDB Service' : 'Dedicated Host',
      database: mongoose.connection.db?.databaseName || 'pre-school',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Database health check failed:', error?.message);
    return NextResponse.json(
      {
        success: false,
        status: 'DISCONNECTED',
        error: 'Database connection could not be established.',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
