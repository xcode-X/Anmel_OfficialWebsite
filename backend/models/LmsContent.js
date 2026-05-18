import mongoose from 'mongoose';

const lmsContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  contentType: { type: String, enum: ['video', 'document', 'lesson'], required: true },
  courseSlug: { type: String, default: 'general' },
  moduleLabel: { type: String, default: '' },
  description: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  durationMin: { type: Number, default: 0 },
  recordedAt: { type: String, default: '' },
  published: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  scheduledPublishAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('LmsContent', lmsContentSchema);
