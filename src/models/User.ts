import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole, UserStatus, SchoolLevel } from '@/types';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  email: string;
  personalEmail?: string;
  role: UserRole;
  phone: string;
  photo?: string;
  avatar?: string;
  address?: string;
  dateOfJoining?: string;
  employeeId?: string;
  assignedClass?: SchoolLevel;
  assignedSection?: string;
  studentId?: string;
  studentIds?: string[];
  status?: UserStatus;
  passwordHash?: string;
  emailVerified?: boolean;
  verificationToken?: string;
  verificationExpiresAt?: string;
  mustChangePassword?: boolean;
  removedAt?: string;
  removedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    personalEmail: { type: String, index: true },
    role: { 
      type: String, 
      enum: ['OWNER', 'ADMIN', 'TEACHER', 'STAFF', 'PARENT', 'STUDENT'], 
      required: true 
    },
    phone: { type: String, required: true, index: true },
    photo: { type: String },
    avatar: { type: String },
    address: { type: String },
    dateOfJoining: { type: String },
    employeeId: { type: String },
    assignedClass: { type: String, enum: ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'] },
    assignedSection: { type: String },
    studentId: { type: String },
    studentIds: [{ type: String }],
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'REMOVED'], default: 'ACTIVE' },
    passwordHash: { type: String },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpiresAt: { type: String },
    mustChangePassword: { type: Boolean, default: false },
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

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);

export default UserModel;
