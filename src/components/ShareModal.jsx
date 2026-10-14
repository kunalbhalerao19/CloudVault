import { useState } from 'react';
import { X, Share2, Mail } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, onShare, fileName }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  function reset() {
    setEmail('');
    setError('');
    setSuccess(false);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleShare() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter an email address.');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onShare(trimmed);
      setSuccess(true);
      setEmail('');
      setTimeout(handleClose, 1200);
    } catch {
      setError('Failed to share. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={handleClose}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">Share File</h2>
          <button className="modal__close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* File name chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius)',
          marginBottom: 20,
        }}>
          <Share2 size={16} style={{ color: 'var(--accent-light)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-all' }}>
            {fileName}
          </span>
        </div>

        {/* Email input */}
        <div className="form-group">
          <label className="form-label" htmlFor="share-email">
            Share with (email address)
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none',
            }}>
              <Mail size={15} />
            </span>
            <input
              id="share-email"
              type="email"
              className="form-input"
              placeholder="colleague@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); setSuccess(false); }}
              onKeyDown={e => e.key === 'Enter' && handleShare()}
              style={{ paddingLeft: 38 }}
              autoFocus
            />
          </div>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="alert alert--error" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert--success" style={{ marginTop: 12 }}>
            File shared successfully!
          </div>
        )}

        {/* Footer */}
        <div className="modal__footer">
          <button className="btn btn--ghost" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn btn--primary"
            onClick={handleShare}
            disabled={loading || success}
          >
            {loading
              ? <><span className="spinner" /> Sharing…</>
              : <><Share2 size={15} /> Share</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
