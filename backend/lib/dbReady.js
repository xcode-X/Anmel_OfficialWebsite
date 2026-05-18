import mongoose from 'mongoose';

/**
 * True when MongoDB is connected (readyState 1) or actively reconnecting (readyState 2).
 * Buffered commands will execute once the connection is restored within bufferTimeoutMS.
 */
export function isDbConnected() {
  return mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2;
}
