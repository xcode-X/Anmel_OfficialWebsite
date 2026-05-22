/**
 * Scholarship applicant email hooks.
 * Browser clients cannot send SMTP securely; when the Express API is deployed,
 * add server-side mail and call it from here if needed.
 */
export async function sendScholarshipApplicationReceivedEmail({ email }) {
  if (!email) return { sent: false };
  return { sent: false, skipped: true };
}

export async function sendScholarshipStatusUpdateEmail({ email }) {
  if (!email) return { sent: false };
  return { sent: false, skipped: true };
}
