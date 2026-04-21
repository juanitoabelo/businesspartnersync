import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiMessageSquare, FiBriefcase, FiTrendingUp, FiArrowRight, FiSearch } from 'react-icons/fi';

const API_URL = '/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, matchesRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/dashboard`),
        axios.get(`${API_URL}/users/matches`)
      ]);
      setStats(statsRes.data);
      setMatches(matchesRes.data.slice(0, 4));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (profile) => {
    if (profile?.firstName) {
      return `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>;
  }

  const isProvider = user?.role === 'provider';

  return (
    <div>
      <div className="page-header">
        <h2>Welcome back, {user?.profile?.firstName || 'Partner'}!</h2>
        <p>Here's what's happening with your partnerships</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiUsers size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>{isProvider ? 'Total Deals' : 'Active Partnerships'}</h3>
          <div className="value">{stats?.totalDeals || stats?.activePartnerships || 0}</div>
          <div className="change positive">+12% from last month</div>
        </div>
        <div className="stat-card">
          <FiBriefcase size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>{isProvider ? 'Active Deals' : 'Invested'}</h3>
          <div className="value">{stats?.activeDeals || stats?.activePartnerships || 0}</div>
          <div className="change positive">+8% from last month</div>
        </div>
        <div className="stat-card">
          <FiMessageSquare size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Messages</h3>
          <div className="value">{user?.stats?.messages || 0}</div>
          <div className="change">3 new today</div>
        </div>
        <div className="stat-card">
          <FiTrendingUp size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Connections</h3>
          <div className="value">{user?.stats?.connections || 0}</div>
          <div className="change positive">+5% from last month</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '24px' }}>Recommended Matches</h3>
        <Link to="/discover" className="btn btn-outline btn-sm">
          View All <FiArrowRight />
        </Link>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-4">
          {matches.map((match) => (
            <div key={match._id} className="card">
              <div className="user-card">
                <div className="user-avatar">
                  {getInitials(match.profile)}
                </div>
                <div className="user-info">
                  <h4>{match.profile?.companyName || 'Unnamed'}</h4>
                  <p>{match.profile?.location || 'Location not set'}</p>
                </div>
              </div>
              {match.role === 'provider' && match.providerDetails?.skills && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {match.providerDetails.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="badge badge-accent">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {match.role === 'seeker' && match.seekerDetails?.industry && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {match.seekerDetails.industry} • Revenue: ${match.seekerDetails.monthlyRevenue?.toLocaleString()}/mo
                  </p>
                </div>
              )}
              <Link to={`/profile/${match._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '16px' }}>
                View Profile
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <FiSearch size={64} />
          <h3>No matches yet</h3>
          <p>Complete your profile to get personalized matches</p>
          <Link to="/profile" className="btn btn-primary">Complete Profile</Link>
        </div>
      )}

      <div className="card" style={{ marginTop: '32px' }}>
        <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/discover" className="btn btn-primary">
            <FiSearch /> Find Partners
          </Link>
          <Link to="/connections" className="btn btn-secondary">
            <FiUsers /> Manage Connections
          </Link>
          <Link to="/messages" className="btn btn-secondary">
            <FiMessageSquare /> Messages
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;