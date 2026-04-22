import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiPlus, FiDollarSign, FiCheck, FiClock, FiX } from 'react-icons/fi';

const API_URL = '/api';

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [dealTerms, setDealTerms] = useState({ type: 'revenue_share', monthlyRetainer: '', revenueShare: '', projectFee: '', description: '' });

  useEffect(() => {
    fetchDeals();
  }, [filter]);

  useEffect(() => {
    if (showModal) {
      fetchConnections();
    }
  }, [showModal]);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${API_URL}/connections?status=accepted`);
      setConnections(res.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

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

  const createDeal = async () => {
    if (!selectedPartner) return;
    try {
      const dealData = {
        providerId: user.role === 'provider' ? user._id : selectedPartner._id,
        seekerId: user.role === 'seeker' ? user._id : selectedPartner._id,
        status: 'draft',
        terms: {
          type: dealTerms.type,
          monthlyRetainer: Number(dealTerms.monthlyRetainer) || 0,
          revenueShare: Number(dealTerms.revenueShare) || 0,
          projectFee: Number(dealTerms.projectFee) || 0,
          description: dealTerms.description
        }
      };
      await axios.post(`${API_URL}/deals`, dealData);
      setShowModal(false);
      setSelectedPartner(null);
      setDealTerms({ type: 'revenue_share', monthlyRetainer: '', revenueShare: '', projectFee: '', description: '' });
      fetchDeals();
    } catch (error) {
      console.error('Error creating deal:', error);
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '32px' }}>
            <div className="modal-header" style={{ marginBottom: '28px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>Create New Deal</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {selectedPartner ? `Deal with ${selectedPartner?.profile?.companyName}` : 'Select a connected partner'}
                </p>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); setSelectedPartner(null); }} style={{ fontSize: '24px', padding: '4px' }}>×</button>
            </div>
            
            {!selectedPartner ? (
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                  Your connected partners
                </p>
                {connections.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                    <FiBriefcase size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
                      No connections yet
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      Go to Discover to connect with partners first.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                    {connections.map((conn) => (
                      <div
                        key={conn._id}
                        onClick={() => setSelectedPartner(conn.user)}
                        style={{ 
                          padding: '16px', 
                          cursor: 'pointer',
                          background: 'var(--bg-secondary)',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div className="user-avatar" style={{ width: '44px', height: '44px', fontSize: '14px', flexShrink: 0 }}>
                          {getInitials(conn.user?.profile)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '2px' }}>{conn.user?.profile?.companyName}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {conn.user?.role === 'provider' ? 'Service Provider' : 'Business Owner'}
                          </div>
                        </div>
                        <FiPlus style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setSelectedPartner(null)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#E0A458', 
                    fontSize: '13px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginBottom: '20px',
                    padding: 0,
                    fontWeight: 500
                  }}
                >
                  ← Select different partner
                </button>
                
                <div style={{ 
                  padding: '20px 24px', 
                  background: 'linear-gradient(135deg, rgba(224, 164, 88, 0.12) 0%, rgba(224, 164, 88, 0.04) 100%)',
                  borderRadius: '16px',
                  marginBottom: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  border: '1px solid rgba(224, 164, 88, 0.2)'
                }}>
                  <div className="user-avatar" style={{ width: '56px', height: '56px', fontSize: '18px', flexShrink: 0, background: '#E0A458', color: '#0D1B2A' }}>
                    {getInitials(selectedPartner?.profile)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '4px', color: '#fff' }}>{selectedPartner?.profile?.companyName}</div>
                    <div style={{ fontSize: '13px', color: '#8892A0' }}>
                      {selectedPartner?.role === 'provider' ? 'Service Provider' : 'Business Owner'}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '14px', color: '#8892A0', letterSpacing: '0.02em' }}>DEAL TYPE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { value: 'revenue_share', label: 'Revenue Share', icon: '📊' },
                      { value: 'monthly_retainer', label: 'Retainer', icon: '💎' },
                      { value: 'project', label: 'Project', icon: '📁' }
                    ].map((type) => (
                      <div
                        key={type.value}
                        onClick={() => setDealTerms({ ...dealTerms, type: type.value })}
                        style={{
                          padding: '20px 16px',
                          borderRadius: '14px',
                          border: `2px solid ${dealTerms.type === type.value ? '#E0A458' : 'var(--border)'}`,
                          background: dealTerms.type === type.value ? 'rgba(224, 164, 88, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                          color: dealTerms.type === type.value ? '#E0A458' : 'var(--text-secondary)',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '14px',
                          fontWeight: 500
                        }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{type.icon}</div>
                        {type.label}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500, fontSize: '14px', color: '#8892A0' }}>
                    {dealTerms.type === 'revenue_share' ? 'Revenue Percentage' : 
                     dealTerms.type === 'monthly_retainer' ? 'Monthly Retainer Amount' : 'Project Fee Amount'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', 
                      left: '18px', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#8892A0',
                      fontSize: '16px',
                      fontWeight: 500,
                      pointerEvents: 'none'
                    }}>
                      {dealTerms.type === 'revenue_share' ? '%' : '$'}
                    </span>
                    <input
                      type="number"
                      className="input"
                      style={{ 
                        fontSize: '18px', 
                        padding: '18px 18px 18px ' + (dealTerms.type === 'revenue_share' ? '36px' : '36px'),
                        fontWeight: 500,
                        background: 'rgba(255, 255, 255, 0.03)'
                      }}
                      placeholder={dealTerms.type === 'revenue_share' ? '15' : '5,000'}
                      value={dealTerms.type === 'revenue_share' ? dealTerms.revenueShare : 
                            dealTerms.type === 'monthly_retainer' ? dealTerms.monthlyRetainer : dealTerms.projectFee}
                      onChange={(e) => setDealTerms({ 
                        ...dealTerms, 
                        [dealTerms.type === 'revenue_share' ? 'revenueShare' : 
                         dealTerms.type === 'monthly_retainer' ? 'monthlyRetainer' : 'projectFee']: e.target.value 
                      })}
                    />
                  </div>
                </div>
                
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 500, fontSize: '14px', color: '#8892A0' }}>
                    Description <span style={{ fontWeight: 400, color: '#5A6470' }}>(optional)</span>
                  </label>
                  <textarea
                    className="input"
                    style={{ 
                      minHeight: '100px', 
                      resize: 'vertical',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}
                    placeholder="Describe the partnership terms, expectations, deliverables, or any specific details..."
                    value={dealTerms.description}
                    onChange={(e) => setDealTerms({ ...dealTerms, description: e.target.value })}
                  />
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={createDeal}
                  style={{ 
                    width: '100%', 
                    padding: '18px', 
                    fontSize: '15px',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <FiPlus size={18} />
                  Create Deal Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;