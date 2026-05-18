import mongoose from 'mongoose';

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, default: 'Security Assessment' },
  client: { type: String, default: '' },
  challenge: { type: String, default: '' },
  solution: { type: String, default: '' },
  results: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  resultSnippet: { type: String, default: '' },
  duration: { type: String, default: '' },
  clientSector: { type: String, default: '' },
  accent: { type: String, default: '' },
  metrics: [{ label: String, value: String }],
  image: { type: String, default: '' },
  beforeAfter: { before: String, after: String },
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('CaseStudy', caseStudySchema);
