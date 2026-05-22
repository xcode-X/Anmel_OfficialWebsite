export function isDuplicateKeyError(err) {
  return err?.code === 11000 || /E11000 duplicate key/i.test(String(err?.message || ''));
}

export function isDbUnavailableError(err) {
  const name = String(err?.name || '');
  const msg = String(err?.message || '');
  return (
    name === 'MongoNetworkTimeoutError' ||
    name === 'MongoServerSelectionError' ||
    name === 'MongoNetworkError' ||
    name === 'MongoTimeoutError' ||
    (name === 'MongooseError' && /buffering timed out/i.test(msg)) ||
    /connection.*timed out/i.test(msg) ||
    /Client must be connected/i.test(msg) ||
    /topology was destroyed/i.test(msg) ||
    /db_query_timeout/i.test(msg)
  );
}

export function duplicateKeyMessage(err) {
  const slugMatch = String(err?.message || '').match(/slug[^"]*"([^"]+)"/i);
  if (slugMatch?.[1]) {
    return `A case study with slug "${slugMatch[1]}" already exists. Edit the existing item or change the title/slug.`;
  }
  return 'A record with this slug or unique field already exists.';
}

/** @returns {{ status: number, error: string } | null} */
export function formatMongoError(err) {
  if (isDuplicateKeyError(err)) {
    return { status: 409, error: duplicateKeyMessage(err) };
  }
  if (isDbUnavailableError(err)) {
    return { status: 503, error: 'Database temporarily unavailable. Please try again in a moment.' };
  }
  return null;
}
