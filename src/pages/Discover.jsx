import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiFilter, FiMapPin, FiDollarSign, FiBriefcase, FiUser, FiUserPlus, FiCheck, FiMessageSquare } from 'react-icons/fi';

const API_URL = '/api';

const SKILLS = ['Web Design', 'SEO', 'Marketing', 'Social Media', 'PPC', 'Email Marketing', 'Content Marketing', 'Analytics'];
const INDUSTRIES = ['E-commerce', 'SaaS', 'Local Business', 'Healthcare', 'Real Estate', 'Finance', 'Education', 'Retail'];

const Discover = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState({});
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '',
    role: user?.role === 'provider' ? 'seeker' : 'provider',
    skills: '',
    industry: '',
    minRevenue: '',
    maxRevenue: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.industry) params.append('industry', filters.industry);
      if (filters.minRevenue) params.append('minRevenue', filters.minRevenue);
      if (filters.maxRevenue) params.append('maxRevenue', filters.maxRevenue);

      const res = await axios.get(`${API_URL}/users?${params}`);
      setUsers(res.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.search, filters.skills, filters.industry, filters.minRevenue, filters.maxRevenue]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${API_URL}/connections`);
      const connected = new Set(res.data.map(c => c.user?._id || c.user));
      setConnectedIds(connected);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const applyFilters = () => {
    fetchUsers();
  };

  const handleConnect = async (recipientId) => {
    setConnecting({ ...connecting, [recipientId]: true });
    try {
      await axios.post(`${API_URL}/connections`, { recipientId, message: 'Hi! I would like to connect with you.' });
      setConnectedIds(new Set([...connectedIds, recipientId]));
    } catch (error) {
      console.error('Error connecting:', error);
      alert(error.response?.data?.message || 'Failed to connect');
    } finally {
      setConnecting({ ...connecting, [recipientId]: false });
    }
  };

  const getInitials = (profile) => {
    if (profile?.firstName) {
      return `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  return (
    <div>
      <div className="page-header">
        <h2>Discover Partners</h2>
        <p>Find the perfect business match for your skills or needs</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, company, or skills..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
        <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)}>
          <FiFilter /> Filters
        </button>
        <button className="btn btn-primary" onClick={applyFilters}>
          <FiSearch /> Search
        </button>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="grid grid-3" style={{ gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Looking For</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="seeker">Businesses Seeking Help</option>
                <option value="provider">Service Providers</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Skills Needed</label>
              <select
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
              >
                <option value="">All Skills</option>
                {SKILLS.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Min Revenue ($)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minRevenue}
                onChange={(e) => handleFilterChange('minRevenue', e.target.value)}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Max Revenue ($)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxRevenue}
                onChange={(e) => handleFilterChange('maxRevenue', e.target.value)}
              />
            </div>
            <div className="input-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-primary" onClick={applyFilters} style={{ width: '100%' }}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filters.role === 'seeker' ? 'active' : ''}`}
          onClick={() => handleFilterChange('role', 'seeker')}
        >
          <FiUser /> Businesses Needing Help
        </button>
        <button
          className={`filter-tab ${filters.role === 'provider' ? 'active' : ''}`}
          onClick={() => handleFilterChange('role', 'provider')}
        >
          <FiBriefcase /> Service Providers
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>
      ) : users.length > 0 ? (
        <div className="grid grid-3">
          {users.map((u) => (
            <div key={u._id} className="card">
              <div className="user-card">
                <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                  {getInitials(u.profile)}
                </div>
                <div className="user-info">
                  <h4>{u.profile?.companyName || 'Unnamed Business'}</h4>
                  <p>{u.profile?.location || 'Location not specified'}</p>
                </div>
              </div>

              {u.role === 'provider' && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {u.providerDetails?.experience || 0} years experience • ${u.providerDetails?.monthlyRevenue?.toLocaleString()}/mo
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {u.providerDetails?.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="badge badge-accent">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {u.role === 'seeker' && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {u.seekerDetails?.industry || 'Industry not specified'}
                  </p>
                  <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                    Revenue: ${u.seekerDetails?.monthlyRevenue?.toLocaleString() || 0}/mo
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Budget: ${u.seekerDetails?.budget?.toLocaleString() || 0}/mo
                  </p>
                  {u.seekerDetails?.painPoints?.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {u.seekerDetails.painPoints.slice(0, 3).map((point, i) => (
                        <span key={i} className="badge badge-warning">{point}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <Link to={`/profile/${u._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  View
                </Link>
                {connectedIds.has(u._id) ? (
                  <Link to={`/messages?userId=${u._id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                    <FiMessageSquare /> Message
                  </Link>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ flex: 1 }}
                    onClick={() => handleConnect(u._id)}
                    disabled={connecting[u._id]}
                  >
                    <FiUserPlus /> {connecting[u._id] ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <FiSearch size={64} />
          <h3>No partners found</h3>
          <p>Try adjusting your filters to find more matches</p>
        </div>
      )}
    </div>
  );
};

export default Discover;