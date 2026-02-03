import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiShield, FiLock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="settings-section">
        <h3>Account Information</h3>
        <div className="settings-info-grid">
          <div className="settings-info-item">
            <FiUser className="settings-info-icon" />
            <div>
              <label>Username</label>
              <p>{user?.username}</p>
            </div>
          </div>
          <div className="settings-info-item">
            <FiMail className="settings-info-icon" />
            <div>
              <label>Email</label>
              <p>{user?.email}</p>
            </div>
          </div>
          <div className="settings-info-item">
            <FiShield className="settings-info-icon" />
            <div>
              <label>Role</label>
              <p style={{ textTransform: 'capitalize' }}>{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3><FiLock style={{ marginRight: '8px', verticalAlign: 'middle' }} />Change Password</h3>
        <form onSubmit={handleChangePassword} className="settings-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
