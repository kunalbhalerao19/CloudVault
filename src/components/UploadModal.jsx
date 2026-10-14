import { useState, useRef, useCallback } from 'react';
import { X, UploadCloud, File, CheckCircle } from 'lucide-react';

function formatSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)    return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [dragging, setDragging]     = useState(false);
  const [selectedFile, setSelected] = useState(null);
  const [progress, setProgress]     = useState(0);
  const [uploading, setUploading]   = useState(false);
  const [done, setDone]             = useState(false);
  const inputRef = useRef(null);

  function reset() {
    setSelected(null);
    setProgress(0);
    setUploading(false);
    setDone(false);
    setDragging(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function pickFile(file) {
    if (!file) return;
    reset();
    setSelected(file);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    pickFile(file);
  }, []);

  async function handleUpload() {
    if (!selectedFile || uploading) return;
    setUploading(true);
    setProgress(0);

    // Fake progress animation
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 18;
      if (pct >= 90) { clearInterval(interval); pct = 90; }
      setProgress(Math.min(pct, 90));
    }, 120);

    try {
      await onUpload(selectedFile);
      clearInterval(interval);
      setProgress(100);
      setDone(true);
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch {
      clearInterval(interval);
      setUploading(false);
      setProgress(0);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={handleClose}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">Upload File</h2>
          <button className="modal__close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        {!selectedFile && (
          <div
            className={`upload-zone${dragging ? ' upload-zone--active' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="upload-zone__icon">
              <UploadCloud size={24} />
            </div>
            <p className="upload-zone__title">
              Drag &amp; drop your file here
            </p>
            <p className="upload-zone__subtitle">
              or{' '}
              <span className="upload-zone__browse">browse to upload</span>
            </p>
            <input
              ref={inputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => pickFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Selected file */}
        {selectedFile && (
          <>
            <div className="upload-selected-file">
              <File size={20} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
              <div className="upload-selected-file__info">
                <p className="upload-selected-file__name">{selectedFile.name}</p>
                <p className="upload-selected-file__size">{formatSize(selectedFile.size)}</p>
              </div>
              {!uploading && (
                <button
                  className="btn--icon"
                  onClick={reset}
                  title="Remove"
                >
                  <X size={15} />
                </button>
              )}
              {done && <CheckCircle size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />}
            </div>

            {uploading && (
              <div className="upload-progress">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>{done ? 'Upload complete!' : 'Uploading…'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="upload-progress__bar">
                  <div className="upload-progress__fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={handleClose} disabled={uploading && !done}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading && !done
              ? <><span className="spinner" /> Uploading…</>
              : done
              ? 'Done!'
              : <><UploadCloud size={15} /> Upload</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
