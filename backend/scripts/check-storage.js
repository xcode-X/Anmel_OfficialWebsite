import 'dotenv/config';
import { getStorageDriver } from '../lib/fileStorage.js';
import { isS3Enabled, verifyS3Connection, objectPublicUrl } from '../lib/s3Storage.js';

const driver = getStorageDriver();
console.log('Storage driver:', driver);

if (isS3Enabled()) {
  const result = await verifyS3Connection();
  console.log('S3 check:', result);
  console.log('Sample URL:', objectPublicUrl('/uploads/test.webp'));
} else {
  console.log('Local uploads path configured (STORAGE_DRIVER=local or missing S3 credentials)');
}
