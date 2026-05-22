/**
 * Migration: base64 in MongoDB → file storage (local disk or S3/R2).
 * When STORAGE_DRIVER=s3, also uploads existing /uploads/* files from disk to the bucket.
 *
 * Usage (from backend/):
 *   npm run migrate:media
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import {
  ensureUploadDirs,
  persistMediaValue,
  isDataUrl,
  isStoredUploadPath,
  mirrorLocalFileToS3,
} from '../lib/fileStorage.js';
import { isS3Enabled } from '../lib/s3Storage.js';
import { STUDENT_DOC_FIELDS, AGENT_DOC_FIELDS } from '../lib/mediaFields.js';
import University from '../models/University.js';
import Scholarship from '../models/Scholarship.js';
import ScholarshipApplication from '../models/ScholarshipApplication.js';
import StudentRegistration from '../models/StudentRegistration.js';
import Agent from '../models/Agent.js';

async function migrateBase64(Model, fields, category, label) {
  const query = { $or: fields.map((f) => ({ [f]: /^data:/ })) };
  const docs = await Model.find(query).lean();
  console.log(`[${label}] ${docs.length} document(s) with base64 media`);
  let updated = 0;
  for (const doc of docs) {
    const patch = {};
    for (const field of fields) {
      const val = doc[field];
      if (!val || !isDataUrl(val)) continue;
      try {
        patch[field] = await persistMediaValue(val, {
          category,
          fileId: `${doc._id}-${field}`,
        });
      } catch (e) {
        console.warn(`  skip ${doc._id} ${field}:`, e.message);
      }
    }
    if (Object.keys(patch).length) {
      await Model.updateOne({ _id: doc._id }, { $set: patch });
      updated += 1;
    }
  }
  console.log(`[${label}] migrated base64 → storage: ${updated}`);
}

async function mirrorDiskPathsToS3(Model, fields, label) {
  if (!isS3Enabled()) return;
  const query = {
    $or: fields.map((f) => ({ [f]: /^\/uploads\// })),
  };
  const docs = await Model.find(query).lean();
  console.log(`[${label}] ${docs.length} document(s) with local /uploads paths to mirror to S3`);
  let mirrored = 0;
  for (const doc of docs) {
    for (const field of fields) {
      const val = doc[field];
      if (!val || !isStoredUploadPath(val)) continue;
      try {
        await mirrorLocalFileToS3(val);
        mirrored += 1;
      } catch (e) {
        console.warn(`  mirror skip ${doc._id} ${field}:`, e.message);
      }
    }
  }
  console.log(`[${label}] mirrored ${mirrored} file(s) to S3`);
}

async function main() {
  console.log(`Storage driver: ${isS3Enabled() ? 's3' : 'local'}`);
  await connectDB();
  await ensureUploadDirs();

  const jobs = [
    [University, ['image'], 'universities', 'University'],
    [Scholarship, ['thumbnail'], 'scholarships', 'Scholarship'],
    [StudentRegistration, STUDENT_DOC_FIELDS, 'students', 'StudentRegistration'],
    [ScholarshipApplication, STUDENT_DOC_FIELDS, 'scholarship-applications', 'ScholarshipApplication'],
    [Agent, AGENT_DOC_FIELDS, 'agents', 'Agent'],
  ];

  for (const [Model, fields, category, label] of jobs) {
    await migrateBase64(Model, fields, category, label);
    await mirrorDiskPathsToS3(Model, fields, label);
  }

  if (isS3Enabled()) {
    const { verifyS3Connection } = await import('../lib/s3Storage.js');
    const check = await verifyS3Connection();
    console.log('S3 connection:', check.ok ? 'OK' : check.reason);
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
