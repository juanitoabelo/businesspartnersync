import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiMessageSquare, FiBriefcase, FiBarChart2, FiUser, FiSettings, FiLogOut, FiSearch, FiTarget } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/discover', icon: FiSearch, label: 'Discover' },
    { path: '/connections', icon: FiUsers, label: 'Connections' },
    { path: '/messages', icon: FiMessageSquare, label: 'Messages' },
    { path: '/deals', icon: FiBriefcase, label: 'Deals' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const getInitials = () => {
    if (user?.profile?.firstName) {
      return `${user.profile.firstName[0]}${user.profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <FiTarget size={28} color="#E0A458" />
          <h1>PartnerSync</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div style={{ flex: 1 }} />

          <NavLink to={`/profile/${user?._id}`} className="nav-item">
            <FiUser />
            <span>Profile</span>
          </NavLink>
          <NavLink to="/settings" className="nav-item">
            <FiSettings />
            <span>Settings</span>
          </NavLink>
          <button onClick={handleLogout} className="nav-item" style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </nav>

        <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '16px' }}>
              {getInitials()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.profile?.companyName || user?.email}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;