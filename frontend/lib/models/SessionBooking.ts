import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionBooking extends Document {
    userId: mongoose.Types.ObjectId;
    sessionType: 'interview-prep' | 'restart-unfiltered';
    amount: number;
    orderId: string;
    paymentId: string;
    paymentMethod: 'razorpay' | 'upi';
    proofUrl?: string;
    calendlyUrl: string;
    status: 'pending' | 'pending_verification' | 'paid' | 'scheduled' | 'completed' | 'cancelled';
    userEmail: string;
    userName: string;
    createdAt: Date;
    updatedAt: Date;
}

const SessionBookingSchema = new Schema<ISessionBooking>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionType: {
        type: String,
        enum: ['interview-prep', 'restart-unfiltered'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        default: ''
    },
    paymentMethod: {
        type: String,
        enum: ['razorpay', 'upi'],
        default: 'razorpay'
    },
    proofUrl: {
        type: String
    },
    calendlyUrl: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'pending_verification', 'paid', 'scheduled', 'completed', 'cancelled'],
        default: 'pending'
    },
    userEmail: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.models.SessionBooking || mongoose.model<ISessionBooking>('SessionBooking', SessionBookingSchema);
