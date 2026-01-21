import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['exam_date', 'application_deadline', 'custom'], required: true },
    title: String,
    date: { type: Date, required: true, index: true },
    isSent: { type: Boolean, default: false, index: true }
}, { timestamps: true });

// For finding unsent reminders due now
ReminderSchema.index({ isSent: 1, date: 1 });
// For user's reminders
ReminderSchema.index({ user: 1, date: 1 });

const Reminder = mongoose.model('Reminder', ReminderSchema);
export default Reminder;
