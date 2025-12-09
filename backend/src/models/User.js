const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Password field added
    role: { type: String, enum: ['student', 'admin'], default: 'student' },

    // Student Profile
    state: String,
    class_level: String, // e.g. "12th", "Dropper"
    target_degree: String, // e.g. "B.Tech"
    target_exams: [String],
    budget_range: { min: Number, max: Number },

    // User Data
    saved_colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'College' }],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
UserSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('User', UserSchema);
