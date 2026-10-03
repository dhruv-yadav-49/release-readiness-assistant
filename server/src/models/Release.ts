import mongoose, { Schema, Document } from 'mongoose';

export interface IReleaseItem {
    itemId: string;
    type: 'feature' | 'fix' | 'behaviour_change';
    description: string;
    qaEvidence: string;
    userImpact: string;
}

export interface IRelease extends Document {
    version: string;
    title: string;
    status: 'draft' | 'reviewing' | 'approved' | 'rejected';
    analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
    items: IReleaseItem[];
    limitations: string;
    migrationNotes: string;
    affectedUsers: string;
    previousVersionId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ReleaseSchema: Schema = new Schema({
    version: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, enum: ['draft', 'reviewing', 'approved', 'rejected'], default: 'draft' },
    analysisStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    items: [
        {
            itemId: { type: String, required: true },
            type: { type: String, enum: ['feature', 'fix', 'behaviour_change'] },
            description: { type: String, required: true },
            qaEvidence: { type: String },
            userImpact: { type: String }
        }
    ],
    limitations: { type: String },
    migrationNotes: { type: String },
    affectedUsers: { type: String },
    previousVersionId: { type: Schema.Types.ObjectId, ref: 'Release' }
}, { timestamps: true });

export default mongoose.model<IRelease>('Release', ReleaseSchema);
