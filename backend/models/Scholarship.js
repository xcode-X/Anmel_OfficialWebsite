import mongoose from 'mongoose';

const ScholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  university: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  deadline: { type: Date, required: true },
  scholarshipType: { type: String, required: true, enum: ['Full', 'Partial', 'Merit-based', 'Need-based', 'Government', 'University', 'External'] },
  fundingStatus: { type: String, required: true, enum: ['Fully Funded', 'Partially Funded', 'Tuition Only', 'Living Allowance Only'] },
  eligibility: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  applicationLink: { type: String, trim: true },
  amount: { type: String, trim: true },
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ScholarshipSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Scholarship', ScholarshipSchema);
