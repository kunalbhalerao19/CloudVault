import {
  FileText, Image, Film, Music, Archive,
  File, Table, Download, Share2, Trash2, FolderOpen,
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────── */
function formatSize(bytes) {
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576)    return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)       return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function FileIcon({ type }) {
  const map = {
    pdf:     { icon: FileText, cls: 'file-icon--pdf'   },
    image:   { icon: Image,    cls: 'file-icon--image'  },
    video:   { icon: Film,     cls: 'file-icon--video'  },
    audio:   { icon: Music,    cls: 'file-icon--audio'  },
    zip:     { icon: Archive,  cls: 'file-icon--zip'    },
    doc:     { icon: FileText, cls: 'file-icon--doc'    },
    sheet:   { icon: Table,    cls: 'file-icon--sheet'  },
    default: { icon: File,     cls: 'file-icon--default'},
  };
  const { icon: Icon, cls } = map[type] || map.default;
  return (
    <div className={`file-table__file-icon ${cls}`}>
      <Icon size={17} />
    </div>
  );
}

/* ─── FileTable ─────────────────────────────────────────────────── */
export default function FileTable({ files, onDownload, onShare, onDelete, searchQuery }) {
  const filtered = (files || []).filter(f =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filtered.length === 0) {
    return (
      <div className="file-table-wrapper">
        <div className="file-table__empty">
          <div className="file-table__empty-icon">
            <FolderOpen size={28} />
          </div>
          <p className="file-table__empty-title">
            {searchQuery ? 'No files match your search' : 'No files yet'}
          </p>
          <p className="file-table__empty-text">
            {searchQuery
              ? `Try a different search term.`
              : 'Upload your first file to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-table-wrapper">
      <table className="file-table">
        <thead>
          <tr>
            <th style={{ width: 32 }}></th>
            <th>File Name</th>
            <th>Type</th>
            <th>Size</th>
            <th>Modified</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(file => (
            <tr key={file.id} className="file-table__row">
              {/* Checkbox */}
              <td>
                <input type="checkbox" className="file-table__checkbox" />
              </td>

              {/* Name */}
              <td>
                <div className="file-table__name">
                  <FileIcon type={file.type} />
                  <span>{file.name}</span>
                </div>
              </td>

              {/* Type */}
              <td style={{ textTransform: 'capitalize' }}>
                {file.type === 'default' ? 'Other' : file.type}
              </td>

              {/* Size */}
              <td>{formatSize(file.size)}</td>

              {/* Modified */}
              <td>{formatDate(file.modified)}</td>

              {/* Shared badge */}
              <td>
                {file.shared ? (
                  <span className="file-table__badge file-table__badge--shared">
                    <Share2 size={11} /> Shared
                  </span>
                ) : (
                  <span className="file-table__badge file-table__badge--private">
                    Private
                  </span>
                )}
              </td>

              {/* Actions */}
              <td>
                <div className="file-table__actions" style={{ justifyContent: 'flex-end' }}>
                  <button
                    className="file-table__action-btn file-table__action-btn--download"
                    title="Download"
                    onClick={() => onDownload(file.id, file.name)}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="file-table__action-btn file-table__action-btn--share"
                    title="Share"
                    onClick={() => onShare(file)}
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    className="file-table__action-btn file-table__action-btn--delete"
                    title="Delete"
                    onClick={() => onDelete(file.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
