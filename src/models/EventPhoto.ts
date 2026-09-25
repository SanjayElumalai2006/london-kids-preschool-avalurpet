import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEventPhotoDocument extends Document {
  id: string;
  title: string;
  caption: string;
  date: string;
  category: 'EVENTS' | 'CLASSROOM' | 'PLAY' | 'ARTS' | 'CAMPUS';
  imageUrl: string;
  uploadedBy: string;
  showOnPublicWebsite: boolean;
  targetLevel?: string;
  createdAt?: string;
}

const EventPhotoSchema = new Schema<IEventPhotoDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    caption: { type: String, default: '' },
    date: { type: String, required: true },
    category: {
      type: String,
      enum: ['EVENTS', 'CLASSROOM', 'PLAY', 'ARTS', 'CAMPUS'],
      required: true,
    },
    imageUrl: { type: String, required: true },
    uploadedBy: { type: String, default: 'School Staff' },
    showOnPublicWebsite: { type: Boolean, default: true },
    targetLevel: { type: String, default: 'ALL' },
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

export const EventPhotoModel: Model<IEventPhotoDocument> =
  mongoose.models.EventPhoto ||
  mongoose.model<IEventPhotoDocument>('EventPhoto', EventPhotoSchema);

export default EventPhotoModel;
