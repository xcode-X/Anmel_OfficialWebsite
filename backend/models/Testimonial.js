import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  role:     { type: String, trim: true },
  company:  { type: String, trim: true },
  program:  { type: String, trim: true },
  uni:      { type: String, trim: true },
  quote:    { type: String, required: true },
  outcome:  { type: String, trim: true },
  accent:   { type: String, enum: ['sky', 'purple', 'orange'], default: 'sky' },
  avatar:   { type: String },
  image:    { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Testimonial', testimonialSchema);
