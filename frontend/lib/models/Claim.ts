import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IClaim extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    phoneNumber: string;
    registeredEmail: string;
    claimType: 'general' | 'coding' | 'core';
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    processedAt?: Date;
    rejectionReason?: string;
}

const ClaimSchema = new Schema<IClaim>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    registeredEmail: { type: String, required: true, index: true },
    claimType: {
        type: String,
        enum: ['general', 'coding', 'core'],
        default: 'core'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    submittedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    rejectionReason: { type: String }
}, { timestamps: true });

// Prevent duplicate pending claims for same user
ClaimSchema.index({ userId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

const Claim: Model<IClaim> = mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);

export default Claim;
