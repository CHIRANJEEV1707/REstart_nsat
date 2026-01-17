import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    bundleId?: mongoose.Types.ObjectId;
    productSlug?: string;

    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;

    paymentMethod: 'razorpay' | 'upi';
    proofUrl?: string;
    verificationStatus?: 'pending' | 'approved' | 'rejected';

    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed' | 'pending_verification';
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bundleId: { type: Schema.Types.ObjectId, ref: 'Bundle' }, // Optional if using productSlug
    productSlug: { type: String }, // For hardcoded packages

    razorpayOrderId: { type: String, index: true }, // Optional for UPI
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    paymentMethod: {
        type: String,
        enum: ['razorpay', 'upi'],
        default: 'razorpay'
    },
    proofUrl: String,
    verificationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'pending_verification'],
        default: 'created',
        index: true
    },
}, { timestamps: true });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
