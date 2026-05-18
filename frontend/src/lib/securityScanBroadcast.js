/** Cross-tab signal when an Application Security Checker run finishes (server persists when DB is up). */
export const SECURITY_SCAN_BROADCAST = 'intelera-security-scan-events';

export function notifySecurityScanComplete() {
  try {
    const bc = new BroadcastChannel(SECURITY_SCAN_BROADCAST);
    bc.postMessage({ type: 'scan-complete', t: Date.now() });
    bc.close();
  } catch {
    /* BroadcastChannel unsupported */
  }
}
