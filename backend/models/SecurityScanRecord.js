import mongoose from 'mongoose';

const securityScanRecordSchema = new mongoose.Schema(
  {
    targetUrl: { type: String, required: true, index: true },
    startedAt: { type: Date },
    completedAt: { type: Date, index: true },
    riskScore: { type: Number, default: 0 },
    posture: { type: String, default: '' },
    executiveKeyMessage: { type: String, default: '' },
    scanMode: { type: String, default: '' },
    scanDepth: { type: String, default: '' },
    findingsCount: { type: Number, default: 0 },
    severityCounts: {
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
    },
    aiProvider: { type: String, default: '' },
    aiSummaryText: { type: String, default: '' },
    /** Denormalized counts for admin table (full payload still in `result`) */
    attackScenariosCount: { type: Number, default: 0 },
    weaknessExamplesCount: { type: Number, default: 0 },
    discoveredUrlsCount: { type: Number, default: 0 },
    scriptSourcesCount: { type: Number, default: 0 },
    checksRunCount: { type: Number, default: 0 },
    nmapEnabled: { type: Boolean, default: false },
    nmapOpenPortsCount: { type: Number, default: 0 },
    /** Full Application Security Checker JSON response */
    result: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

securityScanRecordSchema.index({ completedAt: -1 });

export default mongoose.model('SecurityScanRecord', securityScanRecordSchema);
