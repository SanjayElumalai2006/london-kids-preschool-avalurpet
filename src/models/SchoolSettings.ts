import mongoose, { Schema, Document, Model } from 'mongoose';
import { SchoolLevel } from '@/types';

export interface ISchoolSettingsDocument extends Document {
  key: string; // unique identifier e.g. 'main_settings'
  schoolName: string;
  tagline: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  registrationNo: string;
  academicYear: string;
  timings: string;
  fees: Record<SchoolLevel, number>;
}

const SchoolSettingsSchema = new Schema<ISchoolSettingsDocument>(
  {
    key: { type: String, required: true, unique: true, default: 'main_settings' },
    schoolName: { type: String, required: true },
    tagline: { type: String, default: '' },
    address: { type: String, required: true },
    cityState: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    registrationNo: { type: String, default: '' },
    academicYear: { type: String, default: '2026-2027' },
    timings: { type: String, default: '' },
    fees: {
      PLAY_SCHOOL: { type: Number, default: 18000 },
      NURSERY: { type: Number, default: 22000 },
      LKG: { type: Number, default: 26000 },
      UKG: { type: Number, default: 30000 },
    },
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

export const SchoolSettingsModel: Model<ISchoolSettingsDocument> =
  mongoose.models.SchoolSettings ||
  mongoose.model<ISchoolSettingsDocument>('SchoolSettings', SchoolSettingsSchema);

export default SchoolSettingsModel;
