import crypto from 'crypto';

/**
 * Limits concurrent security scans so heavy pentest work does not pile up.
 */
class ScanQueue {
  constructor(maxConcurrent = 2) {
    this.max = Math.max(1, maxConcurrent);
    this.active = 0;
    this.waiting = [];
  }

  getStatus() {
    return {
      max: this.max,
      active: this.active,
      waiting: this.waiting.length,
    };
  }

  async acquire() {
    if (this.active < this.max) {
      this.active += 1;
      return;
    }
    await new Promise((resolve) => {
      this.waiting.push(resolve);
    });
    this.active += 1;
  }

  release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.waiting.shift();
    if (next) next();
  }

  /** Run async work when a slot is available. */
  async run(fn) {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

export const scanQueue = new ScanQueue(
  Number(process.env.SCAN_QUEUE_CONCURRENCY) || 2,
);

/** In-memory async scan jobs (optional client polling). */
const asyncJobs = new Map();
const JOB_TTL_MS = 60 * 60 * 1000;

export function createAsyncJob() {
  const id = crypto.randomUUID();
  asyncJobs.set(id, {
    id,
    status: 'queued',
    createdAt: Date.now(),
    result: null,
    error: null,
  });
  pruneOldJobs();
  return id;
}

export function updateAsyncJob(id, patch) {
  const job = asyncJobs.get(id);
  if (!job) return null;
  Object.assign(job, patch);
  return job;
}

export function getAsyncJob(id) {
  return asyncJobs.get(id) || null;
}

function pruneOldJobs() {
  const cutoff = Date.now() - JOB_TTL_MS;
  for (const [id, job] of asyncJobs) {
    if (job.createdAt < cutoff) asyncJobs.delete(id);
  }
}
