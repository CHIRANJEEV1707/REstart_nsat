import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    bundleId: mongoose.Types.ObjectId;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bundleId: { type: Schema.Types.ObjectId, ref: 'Bundle', required: true, index: true },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created',
        index: true
    },
}, { timestamps: true });

// Compound index for user order history queries
OrderSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
