import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITeacherReviewDocument extends Document {
  id: string;
  studentId: string;
  teacherId: string;
  teacherName: string;
  date: string;
  socialSkills: number;
  fineMotor: number;
  languageCommunication: number;
  emotionalRegulation: number;
  overallRating: number;
  comments: string;
  recommendations?: string;
}

const TeacherReviewSchema = new Schema<ITeacherReviewDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    teacherId: { type: String, required: true },
    teacherName: { type: String, required: true },
    date: { type: String, required: true },
    socialSkills: { type: Number, required: true, min: 1, max: 5 },
    fineMotor: { type: Number, required: true, min: 1, max: 5 },
    languageCommunication: { type: Number, required: true, min: 1, max: 5 },
    emotionalRegulation: { type: Number, required: true, min: 1, max: 5 },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true },
    recommendations: { type: String },
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

export const TeacherReviewModel: Model<ITeacherReviewDocument> =
  mongoose.models.TeacherReview ||
  mongoose.model<ITeacherReviewDocument>('TeacherReview', TeacherReviewSchema);

export default TeacherReviewModel;
