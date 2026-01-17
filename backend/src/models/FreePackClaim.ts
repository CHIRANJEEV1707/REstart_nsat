import mongoose, { Document, Schema } from 'mongoose';

export interface IFreePackClaim extends Document {
    userId: mongoose.Types.ObjectId;
    email: string;
    phone?: string;
    claimedAt: Date;
    source: string; // Where they came from (landing page, referral, etc.)
    createdAt: Date;
}

const FreePackClaimSchema = new Schema<IFreePackClaim>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // One claim per user
        index: true
    },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    claimedAt: { type: Date, default: Date.now },
    source: { type: String, default: 'direct' }
}, { timestamps: true });

export default mongoose.model<IFreePackClaim>('FreePackClaim', FreePackClaimSchema);
