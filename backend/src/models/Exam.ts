import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    code: { type: String, unique: true, sparse: true, index: true }, // e.g. JEEMAIN
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
}, { timestamps: true });

const Exam = mongoose.model('Exam', ExamSchema);
export default Exam;
