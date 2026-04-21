import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiPlus, FiDollarSign, FiCheck, FiClock, FiX } from 'react-icons/fi';

const API_URL = '/api';

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchDeals();
  }, [filter]);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' 
        ? `${API_URL}/deals` 
        : `${API_URL}/deals?status=${filter}`;
      const res = await axios.get(url);
      setDeals(res.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId, status, message = null) => {
    try {
      await axios.put(`${API_URL}/deals/${dealId}`, { status, message });
      fetchDeals();
      setSelectedDeal(null);
    } catch (error) {
      console.error('Error updating deal:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'agreed':
        return <span className="badge badge-success"><FiCheck /> Agreed</span>;
      case 'active':
        return <span className="badge badge-success"><FiClock /> Active</span>;
      case 'negotiating':
        return <span className="badge badge-warning"><FiClock /> Negotiating</span>;
      case 'draft':
        return <span className="badge badge-accent">Draft</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-error"><FiX /> Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Deals</h2>
          <p>Manage your partnership agreements</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Deal
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Deals
        </button>
        <button
          className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Drafts
        </button>
        <button
          className={`filter-tab ${filter === 'negotiating' ? 'active' : ''}`}
          onClick={() => setFilter('negotiating')}
        >
          Negotiating
        </button>
        <button
          className={`filter-tab ${filter === 'agreed' ? 'active' : ''}`}
          onClick={() => setFilter('agreed')}
        >
          Agreed
        </button>
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>
      ) : deals.length > 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="deals-table">
            <thead>
              <tr>
                <th>Partner</th>
                <th>Type</th>
                <th>Terms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar" style={{ width: '40px', height: '40px', fontSize: '14px' }}>
                        {getInitials(deal.otherParty?.profile)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{deal.otherParty?.profile?.companyName}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {deal.otherParty?.role === 'provider' ? 'Service Provider' : 'Business Owner'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent" style={{ textTransform: 'capitalize' }}>
                      {deal.terms?.type || 'Partnership'}
                    </span>
                  </td>
                  <td>
                    {deal.terms?.monthlyRetainer > 0 && (
                      <div><FiDollarSign size={14} /> ${deal.terms.monthlyRetainer}/mo</div>
                    )}
                    {deal.terms?.revenueShare > 0 && (
                      <div><FiDollarSign size={14} /> {deal.terms.revenueShare}% revenue</div>
                    )}
                    {deal.terms?.projectFee > 0 && (
                      <div><FiDollarSign size={14} /> ${deal.terms.projectFee} project</div>
                    )}
                  </td>
                  <td>{getStatusBadge(deal.status)}</td>
                  <td>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card empty-state">
          <FiBriefcase size={64} />
          <h3>No deals yet</h3>
          <p>Create a deal proposal to start negotiating a partnership</p>
        </div>
      )}

      {selectedDeal && (
        <div className="modal" onClick={() => setSelectedDeal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deal Details</h3>
              <button className="modal-close" onClick={() => setSelectedDeal(null)}>×</button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>
                  {getInitials(selectedDeal.otherParty?.profile)}
                </div>
                <div>
                  <h4>{selectedDeal.otherParty?.profile?.companyName}</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {selectedDeal.otherParty?.role === 'provider' ? 'Service Provider' : 'Business Owner'}
                  </p>
                </div>
              </div>

              <div style={{ background: 'var(--primary)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>Deal Terms</h4>
                <div className="grid grid-2" style={{ gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Type</p>
                    <p style={{ textTransform: 'capitalize' }}>{selectedDeal.terms?.type || 'Partnership'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monthly Retainer</p>
                    <p>${selectedDeal.terms?.monthlyRetainer || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Revenue Share</p>
                    <p>{selectedDeal.terms?.revenueShare || 0}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Project Fee</p>
                    <p>${selectedDeal.terms?.projectFee || 0}</p>
                  </div>
                </div>
                {selectedDeal.terms?.description && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Description</p>
                    <p>{selectedDeal.terms.description}</p>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedDeal.status === 'draft' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateDealStatus(selectedDeal._id, 'negotiating')}
                  >
                    Send Proposal
                  </button>
                )}
                {selectedDeal.status === 'negotiating' && selectedDeal.isProvider && (
                  <>
                    <button 
                      className="btn btn-primary"
                      onClick={() => updateDealStatus(selectedDeal._id, 'agreed')}
                    >
                      Accept Deal
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => updateDealStatus(selectedDeal._id, 'cancelled')}
                    >
                      Cancel
                    </button>
                  </>
                )}
                {selectedDeal.status === 'agreed' && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateDealStatus(selectedDeal._id, 'active')}
                  >
                    Start Partnership
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Deal</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Go to Discover to connect with partners first, then create deals from your connections.
            </p>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ width: '100%' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;