import mongoose, { Schema, Document } from 'mongoose';

export interface IReleaseItem {
  type: 'feature' | 'fix' | 'behaviour_change';
  description: string;
  qaEvidence: string;
  userImpact: string;
}

export interface IRelease extends Document {
  version: string;
  title: string;
  status: 'draft' | 'reviewing' | 'approved' | 'rejected';
  items: IReleaseItem[];
  limitations: string;
  migrationNotes: string;
  affectedUsers: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReleaseSchema: Schema = new Schema({
  version: { type: String, required: true },
  title: { type: String, required: true },
  status: { type: String, enum: ['draft', 'reviewing', 'approved', 'rejected'], default: 'draft' },
  items: [
    {
      type: { type: String, enum: ['feature', 'fix', 'behaviour_change'] },
      description: { type: String, required: true },
      qaEvidence: { type: String },
      userImpact: { type: String }
    }
  ],
  limitations: { type: String },
  migrationNotes: { type: String },
  affectedUsers: { type: String }
}, { timestamps: true });

export default mongoose.model<IRelease>('Release', ReleaseSchema);
