import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiGrid },
  { path: '/inventory', label: 'Inventory', icon: FiPackage },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function isActive(path) {
    if (path === '/') return location.pathname === '/';
    if (path === '/inventory') return location.pathname === '/inventory' || location.pathname.startsWith('/items');
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="18" fill="#0D9488" />
            <circle cx="18" cy="18" r="10" fill="#0F766E" opacity="0.6" />
            <circle cx="18" cy="18" r="4" fill="#fff" />
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="18"
                y1="2"
                x2="18"
                y2="6"
                stroke="#fff"
                strokeWidth="1.5"
                transform={`rotate(${i * 30} 18 18)`}
                opacity="0.7"
              />
            ))}
          </svg>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
            >
              <Icon className="sidebar-link-icon" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-link sidebar-logout">
          <FiLogOut className="sidebar-link-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
