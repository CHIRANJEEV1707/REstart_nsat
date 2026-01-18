import mongoose, { Model } from 'mongoose';

export interface IEmailOTP {
    email: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
    resendCount: number;
    createdAt: Date;
}

const EmailOTPSchema = new mongoose.Schema<IEmailOTP>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    resendCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // Auto-delete after 1 hour
    }
});

const EmailOTP: Model<IEmailOTP> = mongoose.models.EmailOTP || mongoose.model<IEmailOTP>('EmailOTP', EmailOTPSchema);
export default EmailOTP;
