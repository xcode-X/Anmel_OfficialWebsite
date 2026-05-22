/**
 * One-time: set hasImage=true for case studies that have a non-empty image field.
 * Run: node scripts/backfill-case-study-hasImage.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import CaseStudy from '../models/CaseStudy.js';

await connectDB();

const result = await CaseStudy.updateMany(
  { image: { $exists: true, $nin: [null, ''] }, hasImage: { $ne: true } },
  { $set: { hasImage: true } },
);

console.log(`Updated ${result.modifiedCount} case studies with hasImage=true`);
await mongoose.disconnect();
process.exit(0);
