import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudentResultDocument extends Document {
  id: string;
  studentId: string;
  term: 'Term 1' | 'Term 2' | 'Annual';
  academicYear: string;
  date: string;
  skills: {
    skillName: string;
    grade: 'Excellent' | 'Very Good' | 'Good' | 'Needs Practice';
    score: number;
  }[];
  attendancePercentage: number;
  teacherRemark: string;
  promotedToNextGrade?: boolean;
}

const SkillSchema = new Schema(
  {
    skillName: { type: String, required: true },
    grade: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Needs Practice'], required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const StudentResultSchema = new Schema<IStudentResultDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    term: { type: String, enum: ['Term 1', 'Term 2', 'Annual'], required: true },
    academicYear: { type: String, required: true },
    date: { type: String, required: true },
    skills: [SkillSchema],
    attendancePercentage: { type: Number, required: true },
    teacherRemark: { type: String, default: '' },
    promotedToNextGrade: { type: Boolean, default: true },
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

export const StudentResultModel: Model<IStudentResultDocument> =
  mongoose.models.StudentResult ||
  mongoose.model<IStudentResultDocument>('StudentResult', StudentResultSchema);

export default StudentResultModel;
