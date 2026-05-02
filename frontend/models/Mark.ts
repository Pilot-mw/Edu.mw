import mongoose, { Schema, Document } from 'mongoose';

export interface IMark extends Document {
  studentId: string;
  subject: string;
  marks: number;
  term: string;
  year: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarkSchema = new Schema<IMark>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100'],
    },
    term: {
      type: String,
      default: 'Term 1',
    },
    year: {
      type: String,
      default: () => new Date().getFullYear().toString(),
    },
  },
  {
    timestamps: true,
  }
);

MarkSchema.index({ studentId: 1, subject: 1, term: 1, year: 1 }, { unique: true });

export default mongoose.models.Mark || mongoose.model<IMark>('Mark', MarkSchema);
