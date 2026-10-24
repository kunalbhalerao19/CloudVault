
import { getAccessToken } from './auth';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
]);

async function apiRequest(path, options = {}) {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('Please sign in again.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

function toDashboardFile(file) {
  const ext = file.fileName?.split('.').pop()?.toLowerCase() || '';
  const typeMap = {
    pdf: 'pdf',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    txt: 'doc',
  };

  return {
    id: file.fileId,
    name: file.fileName,
    type: typeMap[ext] || 'default',
    size: file.fileSize,
    modified: file.uploadedAt,
    shared: false,
    sharedWith: [],
  };
}

export async function getFiles() {
  const data = await apiRequest('/files');
  return (data.files || []).map(toDashboardFile);
}

export async function uploadFile(file) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Only PDF, JPEG, PNG, and plain-text files are allowed.');
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be between 1 byte and 10 MB.');
  }

  const upload = await apiRequest('/files/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  const s3Response = await fetch(upload.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error('S3 upload failed.');
  }

  await apiRequest('/files/metadata', {
    method: 'POST',
    body: JSON.stringify({
      fileId: upload.fileId,
      fileName: file.name,
      fileKey: upload.fileKey,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

  return toDashboardFile({
    fileId: upload.fileId,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  });
}

export async function deleteFile(fileId) {
  return apiRequest(`/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
}

export async function downloadFile(fileId) {
  const data = await apiRequest(
    `/files/${encodeURIComponent(fileId)}/download-url`
  );

  const link = document.createElement('a');
  link.href = data.downloadUrl;
  link.download = data.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  return { success: true };
}

export async function shareFile() {
  throw new Error('File sharing is not implemented by the current backend.');
}
