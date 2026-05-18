import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
  category: { type: String, default: 'Security' },
  featuredImage: { type: String, default: '' },
  published: { type: Boolean, default: false },
  author: { type: String, default: 'Intelera Team' },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('BlogPost', blogPostSchema);
