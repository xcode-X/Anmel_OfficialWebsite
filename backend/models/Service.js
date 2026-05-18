import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  outcomes: { type: String, default: '' },
  /** Optional uploaded cover image (stored as data URL). */
  image: { type: String, default: '' },
  icon: { type: String, default: 'shield' },
  features: [String],
  process: [{ step: Number, title: String, description: String }],
  order: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Service', serviceSchema);
