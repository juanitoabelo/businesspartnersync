import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSettings, FiUser, FiBell, FiLock, FiTrash2, FiLogOut } from 'react-icons/fi';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [notifications, setNotifications] = useState({
    email: true,
    connections: true,
    messages: true,
    deals: false,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'danger', label: 'Danger Zone', icon: FiTrash2 },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
        <p>Manage your account preferences</p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '240px 1fr', gap: '32px' }}>
        <div>
          <div className="card" style={{ padding: '8px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left' }}
              >
                <tab.icon />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'account' && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Account Settings</h3>
              
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled />
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Contact support to change your email address
                </p>
              </div>

              <div className="input-group">
                <label>Role</label>
                <input type="text" value={user?.role === 'provider' ? 'Service Provider' : 'Business Owner'} disabled />
              </div>

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiLogOut /> Sign Out
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Notification Preferences</h3>
              
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive important updates via email' },
                { key: 'connections', label: 'New Connections', desc: 'Get notified when someone connects with you' },
                { key: 'messages', label: 'New Messages', desc: 'Get notified of new messages' },
                { key: 'deals', label: 'Deal Updates', desc: 'Updates on your partnership deals' },
              ].map((item) => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h4>{item.label}</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px' }}>
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: notifications[item.key] ? 'var(--accent)' : 'var(--primary)',
                      borderRadius: '28px',
                      transition: '0.3s',
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '',
                        height: '20px',
                        width: '20px',
                        left: notifications[item.key] ? '26px' : '4px',
                        bottom: '4px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: '0.3s',
                      }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <h3 style={{ marginBottom: '24px' }}>Security Settings</h3>
              
              <div className="input-group">
                <label>Current Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              
              <div className="input-group">
                <label>New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>
              
              <div className="input-group">
                <label>Confirm New Password</label>
                <input type="password" placeholder="••••••••" />
              </div>

              <button className="btn btn-primary" style={{ marginTop: '16px' }}>
                Update Password
              </button>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="card" style={{ borderColor: 'var(--error)' }}>
              <h3 style={{ marginBottom: '16px', color: 'var(--error)' }}>Danger Zone</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="btn btn-secondary" style={{ borderColor: 'var(--error)', color: 'var(--error)' }}>
                <FiTrash2 /> Delete Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;