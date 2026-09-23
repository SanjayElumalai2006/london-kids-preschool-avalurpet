import mongoose, { Schema, Document, Model } from 'mongoose';
import { SchoolLevel, UserStatus } from '@/types';

export interface IStudentDocument extends Document {
  id: string;
  admissionNo: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  level: SchoolLevel;
  section: string;
  rollNo: string;
  bloodGroup: string;
  photo: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  teacherId: string;
  teacherName: string;
  emergencyContact: string;
  medicalNotes: string;
  admissionDate: string;
  status?: UserStatus;
  removedAt?: string;
  removedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const StudentSchema = new Schema<IStudentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    admissionNo: { type: String, required: true, index: true },
    name: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    level: { type: String, enum: ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'], required: true },
    section: { type: String, default: 'A' },
    rollNo: { type: String, default: '01' },
    bloodGroup: { type: String, default: 'O+' },
    photo: { type: String, default: '' },
    parentId: { type: String, default: '' },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    parentEmail: { type: String, required: true },
    teacherId: { type: String, default: '' },
    teacherName: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    medicalNotes: { type: String, default: 'None' },
    admissionDate: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'REMOVED'], default: 'ACTIVE' },
    removedAt: { type: String },
    removedBy: { type: String },
    createdAt: { type: String },
    updatedAt: { type: String },
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

export const StudentModel: Model<IStudentDocument> =
  mongoose.models.Student || mongoose.model<IStudentDocument>('Student', StudentSchema);

export default StudentModel;
