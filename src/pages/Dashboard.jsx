import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Files, Share2, HardDrive } from 'lucide-react';

import Navbar      from '../components/Navbar';
import Sidebar     from '../components/Sidebar';
import FileTable   from '../components/FileTable';
import UploadModal from '../components/UploadModal';
import ShareModal  from '../components/ShareModal';

import { getUser, logout } from '../services/auth';
import { getFiles, uploadFile, deleteFile, shareFile, downloadFile } from '../services/api';

/* ─── Helpers ───────────────────────────────────────────────────── */
function formatSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576)    return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)       return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();

  const [files, setFiles]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchQuery, setSearchQuery]   = useState('');
  const [activeTab, setActiveTab]       = useState('my-files');

  const [uploadOpen, setUploadOpen]     = useState(false);
  const [shareOpen, setShareOpen]       = useState(false);
  const [shareTarget, setShareTarget]   = useState(null); // { id, name }

  /* Load files on mount */
  useEffect(() => {
    (async () => {
      try {
        const data = await getFiles();
        setFiles(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Logout */
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  /* Upload */
  const handleUpload = useCallback(async (file) => {
    const newFile = await uploadFile(file);
    setFiles(prev => [newFile, ...prev]);
  }, []);

  /* Delete */
  async function handleDelete(fileId) {
    await deleteFile(fileId);
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  /* Share — opens the modal */
  function handleShareOpen(file) {
    setShareTarget({ id: file.id, name: file.name });
    setShareOpen(true);
  }

  /* Share — submits */
  async function handleShare(email) {
    if (!shareTarget) return;
    await shareFile(shareTarget.id, email);
    setFiles(prev =>
      prev.map(f =>
        f.id === shareTarget.id
          ? { ...f, shared: true, sharedWith: [...(f.sharedWith || []), email] }
          : f
      )
    );
  }

  /* Download */
  async function handleDownload(fileId, fileName) {
    await downloadFile(fileId, fileName);
  }

  /* Derived stats */
  const totalSize  = files.reduce((acc, f) => acc + f.size, 0);
  const sharedCount = files.filter(f => f.shared).length;

  return (
    <div className="dashboard">
      <Navbar
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="dashboard__main">
        {/* Header */}
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">My Files</h1>
            <p className="dashboard__subtitle">
              {loading ? 'Loading…' : `${files.length} file${files.length !== 1 ? 's' : ''} stored`}
            </p>
          </div>
          <button
            className="btn btn--primary"
            onClick={() => setUploadOpen(true)}
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--blue">
              <Files size={20} />
            </div>
            <div>
              <div className="stat-card__value">{files.length}</div>
              <div className="stat-card__label">Total Files</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--green">
              <HardDrive size={20} />
            </div>
            <div>
              <div className="stat-card__value">{formatSize(totalSize)}</div>
              <div className="stat-card__label">Storage Used</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--yellow">
              <Share2 size={20} />
            </div>
            <div>
              <div className="stat-card__value">{sharedCount}</div>
              <div className="stat-card__label">Shared Files</div>
            </div>
          </div>
        </div>

        {/* File table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <span className="spinner" style={{
              width: 28, height: 28, borderWidth: 3,
              borderColor: 'var(--border)', borderTopColor: 'var(--accent)',
              display: 'inline-block',
            }} />
            <p style={{ marginTop: 16, fontSize: 14 }}>Loading your files…</p>
          </div>
        ) : (
          <FileTable
            files={files}
            searchQuery={searchQuery}
            onDownload={handleDownload}
            onShare={handleShareOpen}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />

      <ShareModal
        isOpen={shareOpen}
        onClose={() => { setShareOpen(false); setShareTarget(null); }}
        onShare={handleShare}
        fileName={shareTarget?.name || ''}
      />
    </div>
  );
}
