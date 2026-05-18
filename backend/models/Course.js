import mongoose from 'mongoose';

const labSchema = new mongoose.Schema({
  title: { type: String, required: true },
  focus: { type: String, default: '' },
}, { _id: false });

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, default: '' },
  topics: [String],
  labs: [labSchema],
  assignment: { type: String, default: '' },
  skillsGained: [String],
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, enum: ['cybersecurity', 'web-development', 'ux-design'], required: true },
  tagline: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  level: { type: String, default: '' },
  durationWeeks: { type: Number, default: 4 },
  format: { type: String, default: '' },
  audience: { type: String, default: '' },
  highlights: [String],
  modules: [moduleSchema],
  prerequisites: [String],
  outcomes: { type: String, default: '' },
  certification: { type: String, default: '' },
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Course', courseSchema);
