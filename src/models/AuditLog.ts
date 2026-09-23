import mongoose, { Schema, Document, Model } from 'mongoose';
import { AuditAction, UserRole } from '@/types';

export interface IAuditLogDocument extends Document {
  id: string;
  action: AuditAction;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: UserRole;
  performedBy: string;
  performedByName: string;
  timestamp: string;
  details: string;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'STATUS_CHANGE', 'PASSWORD_RESET', 'ROLE_CHANGE', 'REMOVE', 'RESTORE'],
      required: true,
    },
    targetUserId: { type: String, required: true },
    targetUserName: { type: String, required: true },
    targetUserRole: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'TEACHER', 'STAFF', 'PARENT', 'STUDENT'],
      required: true,
    },
    performedBy: { type: String, required: true },
    performedByName: { type: String, required: true },
    timestamp: { type: String, required: true },
    details: { type: String, required: true },
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

export const AuditLogModel: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);

export default AuditLogModel;
