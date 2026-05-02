import mongoose, { Schema, Document } from 'mongoose';

export interface IMemo extends Document {
  title: string;
  message: string;
  audience: 'teachers' | 'students' | 'all';
  createdBy: string;
  important: boolean;
  attachmentUrl: string | null;
  fileName: string | null;
  fileType: string | null;
  expiryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const MemoSchema = new Schema<IMemo>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      enum: ['teachers', 'students', 'all'],
    },
    createdBy: {
      type: String,
      required: [true, 'Creator is required'],
      trim: true,
    },
    important: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
      trim: true,
    },
    fileType: {
      type: String,
      default: null,
      enum: ['pdf', 'jpg', 'jpeg', 'png', 'gif', null],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

MemoSchema.index({ audience: 1, createdAt: -1 });
MemoSchema.index({ expiryDate: 1 });

export default mongoose.models.Memo || mongoose.model<IMemo>('Memo', MemoSchema);
