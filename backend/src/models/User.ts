import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'admin';
    state?: string;
    class_level?: string;
    target_degree?: string;
    target_exams?: string[];
    budget_range?: { min: number; max: number };
    saved_colleges?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
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
// Update timestamp on save
UserSchema.pre('save', async function () {
    this.updatedAt = new Date();
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
