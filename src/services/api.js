
import { getAccessToken } from './auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/*
 * Temporary mock data for dashboard features that do not yet have
 * confirmed AWS backend endpoints.
 */
let mockFiles = [
  {
    id: 'f1',
    name: 'project-report.pdf',
    type: 'pdf',
    size: 2457600,
    modified: '2026-10-10T09:30:00Z',
    shared: true,
    sharedWith: ['alice@example.com'],
  },
  {
    id: 'f2',
    name: 'photo-vacation.jpg',
    type: 'image',
    size: 4718592,
    modified: '2026-10-08T14:20:00Z',
    shared: false,
    sharedWith: [],
  },
  {
    id: 'f3',
    name: 'team-meeting.mp4',
    type: 'video',
    size: 157286400,
    modified: '2026-10-06T11:00:00Z',
    shared: true,
    sharedWith: ['bob@example.com', 'charlie@example.com'],
  },
  {
    id: 'f4',
    name: 'budget-2026.xlsx',
    type: 'sheet',
    size: 512000,
    modified: '2026-10-05T16:45:00Z',
    shared: false,
    sharedWith: [],
  },
  {
    id: 'f5',
    name: 'presentation-q4.pptx',
    type: 'doc',
    size: 8388608,
    modified: '2026-10-03T10:00:00Z',
    shared: true,
    sharedWith: ['diana@example.com'],
  },
  {
    id: 'f6',
    name: 'source-code-backup.zip',
    type: 'zip',
    size: 52428800,
    modified: '2026-09-28T08:15:00Z',
    shared: false,
    sharedWith: [],
  },
  {
    id: 'f7',
    name: 'podcast-episode-42.mp3',
    type: 'audio',
    size: 35651584,
    modified: '2026-09-25T19:00:00Z',
    shared: false,
    sharedWith: [],
  },
  {
    id: 'f8',
    name: 'design-mockup-v3.fig',
    type: 'default',
    size: 1048576,
    modified: '2026-09-20T13:30:00Z',
    shared: true,
    sharedWith: ['eve@example.com'],
  },
];

function delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Requests an authenticated presigned URL and uploads the file to S3.
 */
export async function uploadFile(file) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'text/plain',
  ];

  if (!file) {
    throw new Error('Please select a file.');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Only PDF, JPEG, PNG, and plain text files are allowed.'
    );
  }

  if (file.size === 0) {
    throw new Error('Empty files cannot be uploaded.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size must not exceed 10 MB.');
  }

  if (!BASE_URL.startsWith('https://')) {
    throw new Error(
      'Configure VITE_API_BASE_URL in your .env file with the HTTPS API URL.'
    );
  }

  // Get the signed-in user's access token.
  const token = await getAccessToken();

  // Ask the backend for a presigned S3 upload URL.
  const response = await fetch(`${BASE_URL}/files/upload-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      fileSize: file.size,
    }),
  });

 if (!response.ok) {
  throw new Error(
    `Unable to request an upload URL (HTTP ${response.status}). Please try again.`
  );
}

  const result = await response.json();

  // Expected backend response: uploadUrl, fileId, fileKey, expiresIn.
  const uploadUrl = result.uploadUrl;

  if (!uploadUrl) {
    throw new Error(
      'The API response has no uploadUrl. Check the backend response format.'
    );
  }

  if (!result.fileId || !result.fileKey) {
    throw new Error(
      'The API response is missing fileId or fileKey.'
    );
  }

  // Upload directly to S3 using the presigned URL.
  // The Content-Type must match the value used to sign the URL.
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `S3 upload failed (${uploadResponse.status}). Request a fresh upload URL and retry.`
    );
  }

  const extension = file.name.includes('.')
    ? file.name.split('.').pop().toLowerCase()
    : '';

  const typeMap = {
    pdf: 'pdf',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    txt: 'doc',
  };

  const newFile = {
    id: result.fileId,
    fileKey: result.fileKey,
    name: file.name,
    type: typeMap[extension] || 'default',
    size: file.size,
    modified: new Date().toISOString(),
    shared: false,
    sharedWith: [],
  };

  // Keep the uploaded item visible during this browser session.
  // The file listing itself is still mock data.
  mockFiles = [newFile, ...mockFiles];

  return newFile;
}

/**
 * Temporary mock file listing.
 * Not connected to DynamoDB or S3.
 */
export async function getFiles() {
  await delay();
  return [...mockFiles];
}

/**
 * Temporary mock deletion.
 * Does not delete the actual S3 object.
 */
export async function deleteFile(fileId) {
  await delay(300);

  mockFiles = mockFiles.filter(file => file.id !== fileId);

  return { success: true };
}

/**
 * Temporary mock sharing.
 * Does not grant access to another AWS user.
 */
export async function shareFile(fileId, email) {
  await delay(400);

  mockFiles = mockFiles.map(file => {
    if (file.id !== fileId) {
      return file;
    }

    const sharedWith = file.sharedWith || [];

    return {
      ...file,
      shared: true,
      sharedWith: sharedWith.includes(email)
        ? sharedWith
        : [...sharedWith, email],
    };
  });

  return { success: true };
}

/**
 * Temporary placeholder download.
 * Downloads a text file, not the actual S3 object.
 */
export async function downloadFile(fileId, fileName) {
  await delay(200);

  const blob = new Blob(
    [
      `CloudVault mock download: ${fileName}\nFile ID: ${fileId}`,
    ],
    { type: 'text/plain' }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  return { success: true };
}

export { BASE_URL };
