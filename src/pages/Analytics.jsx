import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiTrendingUp, FiUsers, FiBriefcase, FiTarget, FiPieChart } from 'react-icons/fi';

const API_URL = '/api';

const Analytics = () => {
  const { user } = useAuth();
  const [marketData, setMarketData] = useState(null);
  const [skillsDemand, setSkillsDemand] = useState([]);
  const [industryTrends, setIndustryTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [marketRes, skillsRes, industryRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/market-insights`),
        axios.get(`${API_URL}/analytics/skills-demand`),
        axios.get(`${API_URL}/analytics/industry-trends`),
      ]);
      setMarketData(marketRes.data);
      setSkillsDemand(skillsRes.data);
      setIndustryTrends(industryRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Market insights and partnership trends</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <FiUsers size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Total Providers</h3>
          <div className="value">{marketData?.totalProviders || 0}</div>
        </div>
        <div className="stat-card">
          <FiBriefcase size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Businesses Seeking Help</h3>
          <div className="value">{marketData?.totalSeekers || 0}</div>
        </div>
        <div className="stat-card">
          <FiTarget size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Active Partnerships</h3>
          <div className="value">{marketData?.activeDeals || 0}</div>
        </div>
        <div className="stat-card">
          <FiTrendingUp size={24} color="#E0A458" style={{ marginBottom: '12px' }} />
          <h3>Avg Provider Revenue</h3>
          <div className="value">${Math.round(marketData?.avgProviderRevenue || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FiPieChart size={24} color="#E0A458" />
            <h3>Top Skills in Demand</h3>
          </div>
          {skillsDemand.length > 0 ? (
            <div>
              {skillsDemand.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '40px', fontWeight: 600, color: 'var(--accent)' }}>#{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{item.skill}</span>
                      <span>{item.count} businesses</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--primary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${(item.count / Math.max(...skillsDemand.map(s => s.count))) * 100}%`,
                          background: 'var(--gradient)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No data available yet</p>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FiBriefcase size={24} color="#E0A458" />
            <h3>Industries Seeking Help</h3>
          </div>
          {industryTrends.length > 0 ? (
            <div>
              {industryTrends.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '40px', fontWeight: 600, color: 'var(--accent)' }}>#{index + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{item.industry}</span>
                      <span>{item.count} businesses</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--primary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${(item.count / Math.max(...industryTrends.map(i => i.count))) * 100}%`,
                          background: 'var(--gradient)',
                          borderRadius: '3px'
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No data available yet</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '20px' }}>Market Insights</h3>
        <div className="grid grid-3">
          <div style={{ padding: '20px', background: 'var(--primary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Match Rate</h4>
            <p style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{marketData?.matchRate || 0}%</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Of connections become deals</p>
          </div>
          <div style={{ padding: '20px', background: 'var(--primary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Deals</h4>
            <p style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{marketData?.totalDeals || 0}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Partnerships formed</p>
          </div>
          <div style={{ padding: '20px', background: 'var(--primary)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Provider Opportunity</h4>
            <p style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'Syne' }}>{marketData?.totalSeekers - marketData?.activeDeals || 0}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Businesses still seeking partners</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;