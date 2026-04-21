import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';

const API_URL = '/api';

const Connections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchConnections();
  }, [filter]);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${API_URL}/connections` 
        : `${API_URL}/connections?status=${filter}`;
      const res = await axios.get(url);
      setConnections(res.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (connectionId, status) => {
    try {
      await axios.put(`${API_URL}/connections/${connectionId}`, { status });
      fetchConnections();
    } catch (error) {
      console.error('Error responding to connection:', error);
    }
  };

  const handleDelete = async (connectionId) => {
    try {
      await axios.delete(`${API_URL}/connections/${connectionId}`);
      fetchConnections();
    } catch (error) {
      console.error('Error deleting connection:', error);
    }
  };

  const getInitials = (profile) => {
    if (profile?.firstName) {
      return `${profile.firstName[0]}${profile.lastName?.[0] || ''}`.toUpperCase();
    }
    return 'U';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="badge badge-success">Connected</span>;
      case 'declined':
        return <span className="badge badge-error">Declined</span>;
      default:
        return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Connections</h2>
        <p>Manage your partnership requests and connections</p>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Connected
        </button>
        <button
          className={`filter-tab ${filter === 'declined' ? 'active' : ''}`}
          onClick={() => setFilter('declined')}
        >
          Declined
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>
      ) : connections.length > 0 ? (
        <div className="grid">
          {connections.map((conn) => (
            <div key={conn._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="user-avatar">
                  {getInitials(conn.user?.profile)}
                </div>
                <div>
                  <h4 style={{ marginBottom: '4px' }}>{conn.user?.profile?.companyName || 'Unnamed'}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {conn.user?.role === 'provider' ? 'Service Provider' : 'Business Owner'}
                  </p>
                  {conn.message && (
                    <p style={{ fontSize: '13px', color: 'var(--accent)', fontStyle: 'italic' }}>
                      "{conn.message}"
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {getStatusBadge(conn.status)}
                
                {conn.status === 'pending' && !conn.isRequester && (
                  <>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResponse(conn._id, 'accepted')}
                    >
                      <FiCheck /> Accept
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleResponse(conn._id, 'declined')}
                    >
                      <FiX /> Decline
                    </button>
                  </>
                )}

                {conn.status === 'accepted' && (
                  <>
                    <Link to={`/messages?userId=${conn.user?._id}`} className="btn btn-primary btn-sm">
                      <FiMessageSquare /> Message
                    </Link>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDelete(conn._id)}
                      style={{ color: 'var(--error)' }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <FiUsers size={64} />
          <h3>No connections yet</h3>
          <p>Start exploring to find potential partners</p>
          <Link to="/discover" className="btn btn-primary">Discover Partners</Link>
        </div>
      )}
    </div>
  );
};

export default Connections;