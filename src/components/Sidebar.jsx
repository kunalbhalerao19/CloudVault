import { HardDrive, Files, Clock, Share2, Trash2 } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'my-files',       label: 'My Files',       icon: Files   },
  { id: 'recent',         label: 'Recent',          icon: Clock   },
  { id: 'shared',         label: 'Shared with Me',  icon: Share2  },
  { id: 'trash',          label: 'Trash',           icon: Trash2  },
];

// Storage mock: 2.4 GB of 15 GB used
const USED_GB   = 2.4;
const TOTAL_GB  = 15;
const USED_PCT  = (USED_GB / TOTAL_GB) * 100;

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <p className="sidebar__section-title">Navigation</p>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar__item${activeTab === id ? ' sidebar__item--active' : ''}`}
            onClick={() => onTabChange(id)}
          >
            <span className="sidebar__item-icon">
              <Icon size={17} />
            </span>
            {label}
          </button>
        ))}
      </nav>

      {/* Storage indicator */}
      <div className="sidebar__storage">
        <div className="sidebar__storage-label">
          <span>
            <HardDrive size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Storage
          </span>
          <span>{USED_PCT.toFixed(0)}%</span>
        </div>
        <div className="sidebar__storage-bar">
          <div
            className="sidebar__storage-fill"
            style={{ width: `${USED_PCT}%` }}
          />
        </div>
        <p className="sidebar__storage-text">
          {USED_GB} GB of {TOTAL_GB} GB used
        </p>
      </div>
    </aside>
  );
}
