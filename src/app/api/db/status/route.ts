import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import {
  UserModel,
  StudentModel,
  AttendanceModel,
  AdmissionEnquiryModel,
  FeeInvoiceModel,
} from '@/models';

export async function GET() {
  try {
    await connectToDatabase();
    const readyState = mongoose.connection.readyState;
    const isConnected = readyState === 1;

    const host = mongoose.connection.host || '127.0.0.1';
    const isLocal = host.includes('127.0.0.1') || host.includes('localhost');
    const isAtlas = host.includes('mongodb.net') || Boolean(process.env.MONGODB_URI?.includes('mongodb+srv'));

    let counts = {
      users: 0,
      students: 0,
      attendances: 0,
      enquiries: 0,
      invoices: 0,
    };

    if (isConnected) {
      const [users, students, attendances, enquiries, invoices] = await Promise.all([
        UserModel.countDocuments().catch(() => 0),
        StudentModel.countDocuments().catch(() => 0),
        AttendanceModel.countDocuments().catch(() => 0),
        AdmissionEnquiryModel.countDocuments().catch(() => 0),
        FeeInvoiceModel.countDocuments().catch(() => 0),
      ]);
      counts = { users, students, attendances, enquiries, invoices };
    }

    return NextResponse.json({
      success: isConnected,
      status: isConnected ? 'CONNECTED' : 'CONNECTING',
      environment: process.env.NODE_ENV || 'development',
      provider: isAtlas ? 'MongoDB Atlas (Cloud)' : isLocal ? 'Local MongoDB Service' : 'Custom MongoDB Host',
      database: mongoose.connection.db?.databaseName || 'londonkids_preschool',
      host: isLocal ? '127.0.0.1:27017' : host,
      counts,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to get database status:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'DISCONNECTED',
        error: error.message || 'Database connection could not be established.',
        tip: 'Make sure the MongoDB service is running locally or MONGODB_URI is configured.',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
