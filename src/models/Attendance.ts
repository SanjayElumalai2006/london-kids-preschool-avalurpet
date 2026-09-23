import mongoose, { Schema, Document, Model } from 'mongoose';
import { AttendanceStatus } from '@/types';

export interface IAttendanceDocument extends Document {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE'], required: true },
    remarks: { type: String },
    markedBy: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const AttendanceModel: Model<IAttendanceDocument> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', AttendanceSchema);

export default AttendanceModel;
