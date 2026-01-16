import mongoose, { Model } from 'mongoose';

export interface IExam {
    name: string;
    code?: string;
    description?: string;
    dates?: {
        registration_start?: Date;
        registration_end?: Date;
        exam_date_start?: Date;
        exam_date_end?: Date;
    };
    eligibility?: string;
    syllabus_url?: string;
    website?: string;
}

const ExamSchema = new mongoose.Schema<IExam>({
    name: { type: String, required: true },
    code: { type: String, unique: true },
    description: String,
    dates: {
        registration_start: Date,
        registration_end: Date,
        exam_date_start: Date,
        exam_date_end: Date
    },
    eligibility: String,
    syllabus_url: String,
    website: String
});

const Exam: Model<IExam> = mongoose.models.Exam || mongoose.model<IExam>('Exam', ExamSchema);

export default Exam;
