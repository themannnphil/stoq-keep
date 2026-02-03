import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiPlus, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FiPackage className="navbar-icon" />
          <span>Stoq-Keep</span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/items/add" className="nav-link">
            <FiPlus /> Add Item
          </Link>
        </div>
        <div className="navbar-user">
          <span className="user-info">
            <FiUser /> {user?.username}
            {user?.role === 'admin' && <span className="role-badge">Admin</span>}
          </span>
          <button onClick={handleLogout} className="btn-logout" title="Logout">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
