import mongoose, { Schema, Document, Model } from 'mongoose';
import { SchoolLevel } from '@/types';

export interface IActivityPostDocument extends Document {
  id: string;
  level: SchoolLevel | 'ALL';
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: 'Arts & Crafts' | 'Sensory & Play' | 'Music & Dance' | 'Story & Phonics' | 'Outdoor Fun' | 'Celebration';
  createdBy: string;
}

const ActivityPostSchema = new Schema<IActivityPostDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    level: { type: String, enum: ['PLAY_SCHOOL', 'NURSERY', 'LKG', 'UKG', 'ALL'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Arts & Crafts', 'Sensory & Play', 'Music & Dance', 'Story & Phonics', 'Outdoor Fun', 'Celebration'],
      required: true,
    },
    createdBy: { type: String, required: true },
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

export const ActivityPostModel: Model<IActivityPostDocument> =
  mongoose.models.ActivityPost ||
  mongoose.model<IActivityPostDocument>('ActivityPost', ActivityPostSchema);

export default ActivityPostModel;
