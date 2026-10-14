const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/* ─── Mock Data ─────────────────────────────────────────────────── */
let mockFiles = [
  {
    id: 'f1',
    name: 'project-report.pdf',
    type: 'pdf',
    size: 2457600,      // bytes
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

/* ─── Helpers ───────────────────────────────────────────────────── */
function delay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ─── API Methods ───────────────────────────────────────────────── */

/**
 * Returns the list of files for the current user.
 */
export async function getFiles() {
  await delay();
  return [...mockFiles];
}

/**
 * Simulates uploading a file; adds it to the mock list.
 * @param {File} file - native File object from an input/drop
 */
export async function uploadFile(file) {
  await delay(800);

  const ext = file.name.split('.').pop().toLowerCase();
  const typeMap = {
    pdf: 'pdf',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
    mp4: 'video', mov: 'video', avi: 'video',
    mp3: 'audio', wav: 'audio', ogg: 'audio',
    zip: 'zip', rar: 'zip', gz: 'zip', tar: 'zip',
    xlsx: 'sheet', xls: 'sheet', csv: 'sheet',
    doc: 'doc', docx: 'doc', ppt: 'doc', pptx: 'doc', txt: 'doc',
  };

  const newFile = {
    id: 'f_' + Math.random().toString(36).slice(2, 10),
    name: file.name,
    type: typeMap[ext] || 'default',
    size: file.size,
    modified: new Date().toISOString(),
    shared: false,
    sharedWith: [],
  };

  mockFiles = [newFile, ...mockFiles];
  return newFile;
}

/**
 * Simulates deleting a file by id.
 */
export async function deleteFile(fileId) {
  await delay(300);
  mockFiles = mockFiles.filter(f => f.id !== fileId);
  return { success: true };
}

/**
 * Simulates sharing a file with an email address.
 */
export async function shareFile(fileId, email) {
  await delay(400);
  mockFiles = mockFiles.map(f => {
    if (f.id === fileId) {
      const already = f.sharedWith.includes(email);
      return {
        ...f,
        shared: true,
        sharedWith: already ? f.sharedWith : [...f.sharedWith, email],
      };
    }
    return f;
  });
  return { success: true };
}

/**
 * Simulates a file download by creating a Blob URL and triggering a click.
 */
export async function downloadFile(fileId, fileName) {
  await delay(200);
  // Create a tiny placeholder text blob to demonstrate the download mechanism
  const blob = new Blob(
    [`CloudVault mock download: ${fileName}\nFile ID: ${fileId}\nDownloaded: ${new Date().toLocaleString()}`],
    { type: 'text/plain' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { success: true };
}

export { BASE_URL };
