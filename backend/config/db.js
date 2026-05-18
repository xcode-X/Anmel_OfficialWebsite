import mongoose from 'mongoose';
import dns from 'dns';
import tls from 'tls';

// Windows system DNS often refuses SRV queries used by mongodb+srv://
// Override to use Google public DNS which fully supports SRV records
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

// Windows OpenSSL 3.x has a broken AES-GCM engine (error 1C800066:
// ossl_gcm_stream_update: cipher operation failed).  Every TLS 1.2 cipher
// suite that Atlas supports uses AES-GCM, and TLS 1.3's default suites also
// use AES-GCM — so both protocols hit the same Windows bug.
//
// Root cause (now confirmed): the Atlas "tlsv1 alert internal error" we saw
// originally with TLS 1.3 was caused by the Windows client sending corrupted
// AES-GCM frames; Atlas correctly rejected them.
//
// Fix: require TLS 1.3 minimum AND restrict to ChaCha20-Poly1305 only.
// ChaCha20 has no AES-GCM code path whatsoever; it is fully supported by
// MongoDB Atlas and bypasses the Windows OpenSSL GCM engine entirely.
tls.DEFAULT_MIN_VERSION = 'TLSv1.3';
tls.DEFAULT_CIPHERS = 'TLS_CHACHA20_POLY1305_SHA256';

// Allow Mongoose to buffer operations during brief reconnects (up to 30 s).
mongoose.set('bufferTimeoutMS', 30000);

// Atlas M0/M2/M5 free-tier clusters forcibly close connections idle for > 30 s.
// When Atlas kills a connection mid-stream the TLS session is corrupted, producing
// "ossl_gcm_stream_update: cipher operation failed" AES-GCM errors.
//
// Fixes applied:
//   minPoolSize: 0       — don't keep forced-alive idle connections in the pool
//   maxIdleTimeMS: 20000 — driver closes idle app connections after 20 s (before
//                          Atlas's 30 s hard cut), avoiding the forceful TLS teardown
//   maxPoolSize: 5       — fewer concurrent TLS sessions reduces cipher-op failures
//   heartbeatFrequencyMS: 8000 — heartbeat < 30 s keeps the monitoring connection
//                                alive so Atlas doesn't kill it too
const MONGO_OPTS = {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  // 'poll' mode: opens a fresh TCP+TLS connection per heartbeat and closes it
  // immediately after. Avoids the Atlas free-tier idle-cut that kills long-lived
  // streaming monitor connections (causing bad-record-mac / cipher errors).
  serverMonitoringMode: 'poll',
  minPoolSize: 0,
  maxPoolSize: 3,       // fewer live connections = fewer killed mid-read by Atlas
  // 8 s is safely below Atlas M0's ~15-30 s forced-idle cutoff.
  // The driver closes connections proactively rather than waiting for Atlas to
  // pull the rug and corrupt the TLS record (bad_record_mac / MAC check failure).
  maxIdleTimeMS: 8000,
  retryWrites: true,
  w: 'majority',
  tls: true,
  tlsAllowInvalidCertificates: false,
  family: 4,
};

async function tryConnect(uri) {
  await mongoose.connect(uri, MONGO_OPTS);
}

// Exponential backoff reconnect: 5s, 10s, 20s, 40s, capped at 60s.
let _reconnectAttempt = 0;
let _reconnectTimer = null;

function scheduleReconnect(uri) {
  if (_reconnectTimer) return; // already scheduled
  const delay = Math.min(5000 * Math.pow(2, _reconnectAttempt), 60000);
  _reconnectAttempt += 1;
  _reconnectTimer = setTimeout(async () => {
    _reconnectTimer = null;
    try {
      await tryConnect(uri);
      _reconnectAttempt = 0;
    } catch (e) {
      const isIpBlock = /whitelist|ip.*block|not.*allowed/i.test(e.message);
      if (isIpBlock) {
        console.warn('[DB] MongoDB Atlas rejected connection — your IP is not whitelisted.');
        console.warn('[DB] Go to Atlas → Network Access and add your current IP (or 0.0.0.0/0 for dev).');
      } else {
        console.warn(`[DB] Reconnect attempt ${_reconnectAttempt} failed:`, e.message);
      }
      scheduleReconnect(uri);
    }
  }, delay);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  mongoose.connection.on('disconnected', () => {
    console.warn('[DB] Disconnected — scheduling reconnect…');
    scheduleReconnect(uri);
  });

  mongoose.connection.on('error', (err) => {
    // Suppress well-understood reconnection noise that spams the console:
    // - Atlas M0 idle timeout (bad record mac / MAC check / decryption failed)
    // - Windows OpenSSL AES-GCM engine bug (gcm_stream / cipher operation)
    // - IP whitelist rejection
    // - Connection pool cleared after one of the above
    const isTlsNoise = /whitelist|ip.*block|not.*allowed|tlsv1 alert|gcm_stream|cipher operation|bad.record.mac|mac.check|decryption.failed|pool.*cleared|connection.pool/i.test(err.message);
    if (!isTlsNoise) {
      console.warn('[DB] Connection error:', err.message);
    }
  });

  mongoose.connection.on('reconnected', () => {
    _reconnectAttempt = 0;
    console.log('[DB] Reconnected to MongoDB');
  });

  await tryConnect(uri);
}
