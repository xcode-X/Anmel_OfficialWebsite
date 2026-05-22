/** Resolve stored paths and data URLs for admin document preview. */
export function resolveDocUrl(value) {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  if (!v) return null;
  if (v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:')) {
    return v;
  }
  if (v.startsWith('/')) return v;
  return `/${v}`;
}

export function isImageDoc(value) {
  const url = resolveDocUrl(value);
  if (!url) return false;
  if (url.startsWith('data:image/')) return true;
  return /\.(jpe?g|png|gif|webp|bmp)(\?.*)?$/i.test(url);
}

export function isPdfDoc(value) {
  const url = resolveDocUrl(value);
  if (!url) return false;
  if (url.startsWith('data:application/pdf')) return true;
  return /\.pdf(\?.*)?$/i.test(url);
}

export function viewDoc(value) {
  const url = resolveDocUrl(value);
  if (!url) return;
  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(arr[1]);
      const u8arr = new Uint8Array(bstr.length);
      for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
      const blob = new Blob([u8arr], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      return;
    } catch {
      /* fall through */
    }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function downloadDoc(value, label = 'document') {
  const url = resolveDocUrl(value);
  if (!url) return;
  const mime = url.startsWith('data:') ? url.split(';')[0].split(':')[1] : '';
  const ext = mime.includes('pdf')
    ? 'pdf'
    : mime.includes('jpeg') || mime.includes('jpg')
      ? 'jpg'
      : mime.includes('png')
        ? 'png'
        : isPdfDoc(url)
          ? 'pdf'
          : isImageDoc(url)
            ? 'jpg'
            : 'file';
  const link = document.createElement('a');
  link.href = url;
  link.download = `${String(label).replace(/[\s/]+/g, '_')}.${ext}`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const AGENT_DOC_FIELDS = [
  { key: 'passportPhoto', label: 'Passport size photo' },
  { key: 'idDocument', label: 'National ID / Passport' },
];
