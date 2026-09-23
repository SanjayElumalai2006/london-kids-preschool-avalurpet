import mongoose, { Schema, Document, Model } from 'mongoose';
import { SchoolLevel } from '@/types';

export interface INoticeDocument extends Document {
  id: string;
  title: string;
  content: string;
  targetLevel: SchoolLevel | 'ALL';
  date: string;
  authorName: string;
  priority: 'NORMAL' | 'HIGH';
  category: 'Circular' | 'Event' | 'Holiday' | 'Homework';
}

const NoticeSchema = new Schema<INoticeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetLevel: { 
      type: String, 
      enum: ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG', 'ALL'], 
      required: true 
    },
    date: { type: String, required: true },
    authorName: { type: String, required: true },
    priority: { type: String, enum: ['NORMAL', 'HIGH'], default: 'NORMAL' },
    category: { 
      type: String, 
      enum: ['Circular', 'Event', 'Holiday', 'Homework'], 
      default: 'Circular' 
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

export const NoticeModel: Model<INoticeDocument> =
  mongoose.models.Notice || mongoose.model<INoticeDocument>('Notice', NoticeSchema);

export default NoticeModel;
