import mongoose, { Schema, Document } from 'mongoose';

export interface IGeneratedStatement extends Document {
  releaseId: mongoose.Types.ObjectId;
  type: 'technical' | 'stakeholder' | 'risk_limitation' | 'missing_info' | 'unsupported_claim';
  statement: string;
  evidenceReferences: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected';
  isStale: boolean;
  createdAt: Date;
}

const GeneratedStatementSchema: Schema = new Schema({
  releaseId: { type: Schema.Types.ObjectId, ref: 'Release', required: true },
  type: { type: String, enum: ['technical', 'stakeholder', 'risk_limitation', 'missing_info', 'unsupported_claim'], required: true },
  statement: { type: String, required: true },
  evidenceReferences: [{ type: String }],
  reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isStale: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IGeneratedStatement>('GeneratedStatement', GeneratedStatementSchema);
