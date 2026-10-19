
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Files, Share2, HardDrive } from 'lucide-react';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import FileTable from '../components/FileTable';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';

import { getUser, logout } from '../services/auth';
import {
  getFiles,
  uploadFile,
  deleteFile,
  shareFile,
  downloadFile,
} from '../services/api';

function formatSize(bytes) {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
  if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  if (bytes >= 1024) {
    return (bytes / 1024).toFixed(0) + ' KB';
  }
  return bytes + ' B';
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-files');

  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);

  // Load the authenticated Cognito user.
  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await getUser();

        if (active) {
          if (!currentUser) {
            navigate('/login', { replace: true });
            return;
          }

          setUser(currentUser);
        }
      } catch {
        if (active) {
          navigate('/login', { replace: true });
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [navigate]);

  // Load files.
  useEffect(() => {
    let active = true;

    async function loadFiles() {
      try {
        const data = await getFiles();

        if (active) {
          setFiles(data);
        }
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFiles();

    return () => {
      active = false;
    };
  }, []);

  // Logout.
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      navigate('/login', { replace: true });
    }
  }

  // Upload.
  const handleUpload = useCallback(async (file) => {
    const newFile = await uploadFile(file);
    setFiles((prev) => [newFile, ...prev]);
  }, []);

  // Delete.
  async function handleDelete(fileId) {
    await deleteFile(fileId);
    setFiles((prev) => prev.filter((file) => file.id !== fileId));
  }

  // Open share modal.
  function handleShareOpen(file) {
    setShareTarget({ id: file.id, name: file.name });
    setShareOpen(true);
  }

  // Share file.
  async function handleShare(email) {
    if (!shareTarget) return;

    await shareFile(shareTarget.id, email);

    setFiles((prev) =>
      prev.map((file) =>
        file.id === shareTarget.id
          ? {
              ...file,
              shared: true,
              sharedWith: [...(file.sharedWith || []), email],
            }
          : file
      )
    );
  }

  // Download.
  async function handleDownload(fileId, fileName) {
    await downloadFile(fileId, fileName);
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);
  const sharedCount = files.filter((file) => file.shared).length;

  return (
    <div className="dashboard">
      <Navbar
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="dashboard__main">
        <div className="dashboard__header">
          <div>
            <h1 className="dashboard__title">My Files</h1>
            <p className="dashboard__subtitle">
              {loading
                ? 'Loading…'
                : `${files.length} file${files.length !== 1 ? 's' : ''} stored`}
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

        {/* Statistics */}
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
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-muted)',
            }}
          >
            <span
              className="spinner"
              style={{
                width: 28,
                height: 28,
                borderWidth: 3,
                borderColor: 'var(--border)',
                borderTopColor: 'var(--accent)',
                display: 'inline-block',
              }}
            />
            <p style={{ marginTop: 16, fontSize: 14 }}>
              Loading your files…
            </p>
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
        onClose={() => {
          setShareOpen(false);
          setShareTarget(null);
        }}
        onShare={handleShare}
        fileName={shareTarget?.name || ''}
      />
    </div>
  );
}
