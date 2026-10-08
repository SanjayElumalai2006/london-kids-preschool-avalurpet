import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRateLimit extends Document {
  key: string;
  count: number;
  expiresAt: Date;
}

const RateLimitSchema: Schema<IRateLimit> = new Schema(
  {
    key: { type: String, required: true, index: true },
    count: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

// Compound index for fast lookup
RateLimitSchema.index({ key: 1, expiresAt: 1 });

const RateLimitModel: Model<IRateLimit> =
  mongoose.models.RateLimit || mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);

export { RateLimitModel };
export default RateLimitModel;
