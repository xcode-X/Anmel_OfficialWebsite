import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: String,
  level: String,
  duration: String
});

const universitySchema = new mongoose.Schema({
  idName: { type: String, unique: true },
  name: { type: String, required: true },
  country: String,
  image: String,
  description: String,
  ranking: String,
  founded: String,
  students: String,
  website: String,
  courses: [courseSchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('University', universitySchema);
