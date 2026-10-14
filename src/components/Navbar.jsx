import { useState, useRef, useEffect } from 'react';
import { Cloud, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';

export default function Navbar({ user, searchQuery, onSearchChange, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <div className="navbar__logo-icon">
          <Cloud size={20} />
        </div>
        <span className="navbar__logo-text">CloudVault</span>
      </div>

      {/* Search */}
      <div className="navbar__search">
        <span className="navbar__search-icon">
          <Search size={16} />
        </span>
        <input
          type="text"
          placeholder="Search files…"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      <div className="navbar__spacer" />

      {/* User menu */}
      <div
        ref={dropdownRef}
        className={`navbar__user${dropdownOpen ? ' navbar__user--open' : ''}`}
        onClick={() => setDropdownOpen(o => !o)}
      >
        <div className="navbar__avatar">{initials}</div>
        <span className="navbar__user-name">{user?.name || 'User'}</span>
        <span className="navbar__user-chevron">
          <ChevronDown size={16} />
        </span>

        {dropdownOpen && (
          <div className="navbar__dropdown">
            <button className="navbar__dropdown-item" onClick={e => e.stopPropagation()}>
              <User size={15} />
              Profile
            </button>
            <button className="navbar__dropdown-item" onClick={e => e.stopPropagation()}>
              <Settings size={15} />
              Settings
            </button>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button
              className="navbar__dropdown-item navbar__dropdown-item--danger"
              onClick={e => { e.stopPropagation(); onLogout(); }}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
