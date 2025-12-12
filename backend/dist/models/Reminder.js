"use strict";
const mongoose = require('mongoose');
const ReminderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['exam_date', 'application_deadline', 'custom'], required: true },
    title: String,
    date: { type: Date, required: true },
    isSent: { type: Boolean, default: false }
});
module.exports = mongoose.model('Reminder', ReminderSchema);
