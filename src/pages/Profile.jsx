import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiGlobe, FiLinkedin, FiMail, FiEdit, FiPlus, FiX, FiUser, FiBriefcase } from 'react-icons/fi';

const API_URL = '/api';

const SKILLS = ['Web Design', 'SEO', 'Marketing', 'Social Media', 'PPC', 'Email Marketing', 'Content Marketing', 'Analytics', 'Copywriting', 'Branding'];
const PAIN_POINTS = ['Marketing Overwhelm', 'No Time for Sales', 'Need More Clients', 'Low Conversion Rates', 'Limited Budget', 'No Technical Skills', 'Content Creation', 'Social Media Management'];
const INDUSTRIES = ['E-commerce', 'SaaS', 'Local Business', 'Healthcare', 'Real Estate', 'Finance', 'Education', 'Retail', 'Restaurant', 'Professional Services'];

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });

  const isOwnProfile = !id || id === currentUser?._id;
  const viewUser = isOwnProfile ? currentUser : user;

  useEffect(() => {
    if (!isOwnProfile && id) {
      fetchUser(id);
    } else {
      setUser(currentUser);
      setFormData(currentUser || {});
      setLoading(false);
    }
  }, [id, isOwnProfile, currentUser]);

  const fetchUser = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/users/${userId}`);
      setUser(res.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [field]: value }
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSave = async () => {
    try {
      await axios.put('/api/auth/me', formData);
      updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const addSkill = () => {
    if (newSkill && !formData.providerDetails?.skills?.includes(newSkill)) {
      handleChange('providerDetails', 'skills', [...(formData.providerDetails?.skills || []), newSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    handleChange('providerDetails', 'skills', formData.providerDetails?.skills.filter(s => s !== skill));
  };

  const addPainPoint = () => {
    if (newPainPoint && !formData.seekerDetails?.painPoints?.includes(newPainPoint)) {
      handleChange('seekerDetails', 'painPoints', [...(formData.seekerDetails?.painPoints || []), newPainPoint]);
      setNewPainPoint('');
    }
  };

  const removePainPoint = (point) => {
    handleChange('seekerDetails', 'painPoints', formData.seekerDetails?.painPoints.filter(p => p !== point));
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

  const isProvider = viewUser?.role === 'provider';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>{isOwnProfile ? 'My Profile' : 'Profile'}</h2>
          <p>{viewUser?.profile?.companyName}</p>
        </div>
        {isOwnProfile && (
          isEditing ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
            </div>
          ) : (
            <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
              <FiEdit /> Edit Profile
            </button>
          )
        )}
      </div>

      <div className="grid grid-3">
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
              <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '36px' }}>
                {getInitials(viewUser?.profile)}
              </div>
              <div>
                {isEditing ? (
                  <div className="grid grid-2" style={{ gap: '12px', width: '300px' }}>
                    <input
                      type="text"
                      value={formData.profile?.firstName || ''}
                      onChange={(e) => handleChange('profile', 'firstName', e.target.value)}
                      placeholder="First Name"
                      style={{ padding: '10px' }}
                    />
                    <input
                      type="text"
                      value={formData.profile?.lastName || ''}
                      onChange={(e) => handleChange('profile', 'lastName', e.target.value)}
                      placeholder="Last Name"
                      style={{ padding: '10px' }}
                    />
                  </div>
                ) : (
                  <div>
                    <h3>{viewUser?.profile?.firstName} {viewUser?.profile?.lastName}</h3>
                    <p style={{ color: 'var(--accent)' }}>{viewUser?.role === 'provider' ? 'Service Provider' : 'Business Owner'}</p>
                  </div>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className="grid grid-2" style={{ gap: '16px' }}>
                <input
                  type="text"
                  value={formData.profile?.companyName || ''}
                  onChange={(e) => handleChange('profile', 'companyName', e.target.value)}
                  placeholder="Company Name"
                  style={{ padding: '12px' }}
                />
                <input
                  type="text"
                  value={formData.profile?.location || ''}
                  onChange={(e) => handleChange('profile', 'location', e.target.value)}
                  placeholder="Location"
                  style={{ padding: '12px' }}
                />
                <input
                  type="text"
                  value={formData.profile?.website || ''}
                  onChange={(e) => handleChange('profile', 'website', e.target.value)}
                  placeholder="Website"
                  style={{ padding: '12px' }}
                />
                <input
                  type="text"
                  value={formData.profile?.linkedin || ''}
                  onChange={(e) => handleChange('profile', 'linkedin', e.target.value)}
                  placeholder="LinkedIn"
                  style={{ padding: '12px' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {viewUser?.profile?.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <FiMapPin /> {viewUser.profile.location}
                  </div>
                )}
                {viewUser?.profile?.website && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                    <FiGlobe /> {viewUser.profile.website}
                  </div>
                )}
                {viewUser?.profile?.linkedin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)' }}>
                    <FiLinkedin /> {viewUser.profile.linkedin}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.profile?.bio || ''}
                  onChange={(e) => handleChange('profile', 'bio', e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  style={{ width: '100%', padding: '12px', background: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)' }}
                />
              ) : (
                <p>{viewUser?.profile?.bio || 'No bio added yet'}</p>
              )}
            </div>
          </div>

          {isProvider ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3><FiBriefcase /> Skills & Services</h3>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Skills</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {formData.providerDetails?.skills?.map((skill, i) => (
                    <span key={i} className="badge badge-accent" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {skill}
                      {isEditing && <FiX size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      style={{ flex: 1, padding: '10px' }}
                    >
                      <option value="">Add a skill...</option>
                      {SKILLS.filter(s => !formData.providerDetails?.skills?.includes(s)).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={addSkill}><FiPlus /></button>
                  </div>
                )}
              </div>

              <div className="grid grid-2" style={{ gap: '16px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Monthly Revenue</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.providerDetails?.monthlyRevenue || ''}
                      onChange={(e) => handleChange('providerDetails', 'monthlyRevenue', e.target.value)}
                    />
                  ) : (
                    <p style={{ fontSize: '24px', fontWeight: 700 }}>${viewUser?.providerDetails?.monthlyRevenue?.toLocaleString() || 0}</p>
                  )}
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Experience (years)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.providerDetails?.experience || ''}
                      onChange={(e) => handleChange('providerDetails', 'experience', e.target.value)}
                    />
                  ) : (
                    <p style={{ fontSize: '24px', fontWeight: 700 }}>{viewUser?.providerDetails?.experience || 0}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: '20px' }}><FiUser /> Business Details</h3>
              
              <div className="grid grid-2" style={{ gap: '16px', marginBottom: '24px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Industry</label>
                  {isEditing ? (
                    <select
                      value={formData.seekerDetails?.industry || ''}
                      onChange={(e) => handleChange('seekerDetails', 'industry', e.target.value)}
                    >
                      <option value="">Select...</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  ) : (
                    <p>{viewUser?.seekerDetails?.industry || 'Not specified'}</p>
                  )}
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label>Monthly Revenue</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.seekerDetails?.monthlyRevenue || ''}
                      onChange={(e) => handleChange('seekerDetails', 'monthlyRevenue', e.target.value)}
                    />
                  ) : (
                    <p style={{ fontSize: '24px', fontWeight: 700 }}>${viewUser?.seekerDetails?.monthlyRevenue?.toLocaleString() || 0}</p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Pain Points (What help do you need?)</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {formData.seekerDetails?.painPoints?.map((point, i) => (
                    <span key={i} className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {point}
                      {isEditing && <FiX size={14} style={{ cursor: 'pointer' }} onClick={() => removePainPoint(point)} />}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={newPainPoint}
                      onChange={(e) => setNewPainPoint(e.target.value)}
                      style={{ flex: 1, padding: '10px' }}
                    >
                      <option value="">Add a pain point...</option>
                      {PAIN_POINTS.filter(p => !formData.seekerDetails?.painPoints?.includes(p)).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary btn-sm" onClick={addPainPoint}><FiPlus /></button>
                  </div>
                )}
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Budget for Marketing Help</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.seekerDetails?.budget || ''}
                    onChange={(e) => handleChange('seekerDetails', 'budget', e.target.value)}
                  />
                ) : (
                  <p style={{ fontSize: '24px', fontWeight: 700 }}>${viewUser?.seekerDetails?.budget?.toLocaleString() || 0}/mo</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h4 style={{ marginBottom: '16px' }}>Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Profile Views</span>
                <span>{viewUser?.stats?.views || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connections</span>
                <span>{viewUser?.stats?.connections || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Messages</span>
                <span>{viewUser?.stats?.messages || 0}</span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/messages" className="btn btn-primary" style={{ width: '100%' }}>
                <FiMail /> Send Message
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;