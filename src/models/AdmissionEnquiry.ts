import mongoose, { Schema, Document, Model } from 'mongoose';
import { SchoolLevel, EnquiryStatus } from '@/types';

export interface IAdmissionEnquiryDocument extends Document {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  targetLevel: SchoolLevel;
  message: string;
  submittedAt: string;
  status: EnquiryStatus;
}

const AdmissionEnquirySchema = new Schema<IAdmissionEnquiryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    parentName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    childName: { type: String, required: true },
    childAge: { type: String, required: true },
    targetLevel: { type: String, enum: ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG'], required: true },
    message: { type: String, default: '' },
    submittedAt: { type: String, required: true },
    status: { type: String, enum: ['NEW', 'CONTACTED', 'ADMITTED'], default: 'NEW' },
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

export const AdmissionEnquiryModel: Model<IAdmissionEnquiryDocument> =
  mongoose.models.AdmissionEnquiry ||
  mongoose.model<IAdmissionEnquiryDocument>('AdmissionEnquiry', AdmissionEnquirySchema);

export default AdmissionEnquiryModel;
