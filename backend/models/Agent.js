import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AgentSchema = new mongoose.Schema({
  // Personal Information
  fullName: { type: String, required: true, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'], required: true },
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true, trim: true },
  countryOfResidence: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  residentialAddress: { type: String, required: true, trim: true },

  // Documents
  passportPhoto: { type: String }, // base64 data URL
  idDocument: { type: String },    // base64 data URL
  idDocumentType: { type: String, enum: ['National ID', 'Passport', 'Driver\'s License'] },

  // Professional Information
  organizationName: { type: String, trim: true },
  yearsOfExperience: { type: Number, min: 0, default: 0 },
  areasOfRecruitment: [{ type: String }],
  targetCountries: [{ type: String }],
  studentsPerYear: { type: Number, min: 0, default: 0 },

  // Social & References
  socialMediaLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  referralSource: { type: String, trim: true },
  personalStatement: { type: String, trim: true },
  agreedToTerms: { type: Boolean, required: true, default: false },

  // System Fields
  agentCode: { type: String, unique: true, sparse: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Suspended'], default: 'Pending' },
  adminNotes: { type: String, trim: true },
  password: { type: String },
  temporaryPassword: { type: String },
  loginEnabled: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: String },

  // Stats
  referredStudents: { type: Number, default: 0 },
  activeApplications: { type: Number, default: 0 },
  approvedAdmissions: { type: Number, default: 0 },
  commissionEarned: { type: Number, default: 0 },
  commissionPending: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AgentSchema.pre('save', async function (next) {
  this.updatedAt = new Date();
  if (this.isModified('password') && this.password && !this.password.startsWith('$2')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

AgentSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Agent', AgentSchema);
