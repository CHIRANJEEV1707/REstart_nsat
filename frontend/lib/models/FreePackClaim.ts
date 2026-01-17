import mongoose, { Model } from 'mongoose';

export interface IFreePackClaim {
    userId: mongoose.Types.ObjectId;
    email: string;
    phone?: string;
    claimedAt: Date;
    source: string;
}

const FreePackClaimSchema = new mongoose.Schema<IFreePackClaim>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    phone: { type: String },
    claimedAt: { type: Date, default: Date.now },
    source: { type: String, default: 'direct' }
}, { timestamps: true });

const FreePackClaim: Model<IFreePackClaim> = mongoose.models.FreePackClaim || mongoose.model<IFreePackClaim>('FreePackClaim', FreePackClaimSchema);
export default FreePackClaim;
