import mongoose from 'mongoose';

const studentRegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  courseSlug: { type: String, default: 'general' },
  country: { type: String, default: '' },
  educationLevel: { type: String, default: '' },
  experienceLevel: { type: String, default: '' },
  preferredLearningMode: { type: String, default: '' },
  preferredStartWindow: { type: String, default: '' },
  motivation: { type: String, default: '' },
  university: { type: String, default: '' },
  course: { type: String, default: '' },
  degreeLevel: { type: String, default: '' },
  intake: { type: String, default: '' },
  studyMode: { type: String, default: '' },
  campus: { type: String, default: '' },
  
  // Documents (stored as base64 strings)
  passportPhoto: { type: String, default: '' },
  oLevelCertificate: { type: String, default: '' },
  aLevelCertificate: { type: String, default: '' },
  highSchoolDiploma: { type: String, default: '' },
  waecResult: { type: String, default: '' },
  academicTranscript: { type: String, default: '' },
  bachelorDegree: { type: String, default: '' },
  masterDegree: { type: String, default: '' },
  englishProficiency: { type: String, default: '' },
  healthCertificate: { type: String, default: '' },
  passportBioPage: { type: String, default: '' },
  recommendationLetters: { type: String, default: '' },
  personalStatement: { type: String, default: '' },
  cvResume: { type: String, default: '' },
  otherDocuments: { type: String, default: '' },

  requirementsReceived: { type: Boolean, default: false },
  feesPaid: { type: Boolean, default: false },
  lmsProvisioned: { type: Boolean, default: false },
  lmsProvisionedAt: { type: Date, default: null },
  lmsUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'ready', 'provisioned', 'rejected'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('StudentRegistration', studentRegistrationSchema);
