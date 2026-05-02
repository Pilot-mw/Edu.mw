import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  studentName: string;
  admissionNumber: string;
  class: string;
  gender: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      unique: true,
      trim: true,
    },
    class: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.index({ admissionNumber: 1 });

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
