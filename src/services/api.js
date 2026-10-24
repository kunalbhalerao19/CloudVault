
import { getAccessToken } from './auth';

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://05nxz2uqye.execute-api.ap-south-1.amazonaws.com'
).replace(/\/+$/, '');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
];

async function apiRequest(path, options = {}) {
  const token = await getAccessToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `API request failed (${response.status})`
    );
  }

  return data;
}

function getFileType(fileName, contentType = '') {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (contentType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('text/')) return 'doc';

  const types = {
    mp4: 'video',
    mov: 'video',
    xlsx: 'sheet',
    xls: 'sheet',
    csv: 'sheet',
    ppt: 'doc',
    pptx: 'doc',
    doc: 'doc',
    docx: 'doc',
    zip: 'zip',
    mp3: 'audio',
    wav: 'audio',
  };

  return types[ext] || 'default';
}

function normalizeFile(file) {
  return {
    ...file,
    id: file.fileId ?? file.id,
    name: file.fileName ?? file.name,
    type: file.type ?? getFileType(
      file.fileName ?? file.name ?? '',
      file.contentType ?? ''
    ),
    size: file.fileSize ?? file.size ?? 0,
    modified:
      file.updatedAt ??
      file.createdAt ??
      file.modified ??
      new Date().toISOString(),
    shared: file.shared ?? false,
    sharedWith: file.sharedWith ?? [],
  };
}

/**
 * Upload to S3, then save metadata through the backend API.
 */
export async function uploadFile(file) {
  if (!file) throw new Error('Please select a file.');

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF, JPEG, PNG, and text files are supported.');
  }

  if (file.size <= 0) throw new Error('The file is empty.');

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must not exceed 10 MB.');
  }

  const contentType = file.type || 'application/octet-stream';

  const uploadInfo = await apiRequest('/files/upload-url', {
    method: 'POST',
    body: JSON.stringify({
      fileName: file.name,
      contentType,
      fileSize: file.size,
    }),
  });

  const { uploadUrl, fileId, fileKey } = uploadInfo;

  if (!uploadUrl || !fileId || !fileKey) {
    throw new Error('The upload URL response is missing required fields.');
  }

  const s3Response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!s3Response.ok) {
    throw new Error(`S3 upload failed (${s3Response.status}).`);
  }

  // Metadata saving is a separate API call.
  await apiRequest('/files/metadata', {
    method: 'POST',
    body: JSON.stringify({
      fileId,
      fileKey,
      fileName: file.name,
      contentType,
      fileSize: file.size,
    }),
  });

  return normalizeFile({
    fileId,
    fileKey,
    fileName: file.name,
    contentType,
    fileSize: file.size,
    createdAt: new Date().toISOString(),
  });
}

/**
 * List the authenticated user's files from the backend.
 */
export async function getFiles() {
  const data = await apiRequest('/files');

  if (!Array.isArray(data.files)) {
    throw new Error('Unexpected file-list response: expected a files array.');
  }

  return data.files.map(normalizeFile);
}

/**
 * Delete a file through the backend API.
 */
export async function deleteFile(fileId) {
  if (!fileId) throw new Error('A file ID is required.');

  return apiRequest(`/files/${encodeURIComponent(fileId)}`, {
    method: 'DELETE',
  });
}

/**
 * Sharing is not supported by the currently provided backend endpoints.
 */
export async function shareFile() {
  throw new Error('File sharing is not available in the backend yet.');
}

/**
 * Get a presigned download URL and download the actual S3 file.
 */
export async function downloadFile(fileId, fileName) {
  if (!fileId) throw new Error('A file ID is required.');

  const data = await apiRequest(
    `/files/${encodeURIComponent(fileId)}/download-url`
  );

  if (!data.downloadUrl) {
    throw new Error('The download API did not return a download URL.');
  }

  const link = document.createElement('a');
  link.href = data.downloadUrl;
  link.download = data.fileName || fileName || 'download';
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();

  return { success: true };
}

export { BASE_URL };
