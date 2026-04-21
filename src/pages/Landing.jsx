import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiTrendingUp, FiShield, FiArrowRight } from 'react-icons/fi';
import '../styles/index.css';

const Landing = () => {
  const features = [
    {
      icon: FiUsers,
      title: 'Smart Matching',
      description: 'Our algorithm connects you with partners who complement your skills and business needs perfectly.'
    },
    {
      icon: FiTrendingUp,
      title: 'Revenue Growth',
      description: 'Focus on what you do best while your partner handles client acquisition and business development.'
    },
    {
      icon: FiShield,
      title: 'Verified Partners',
      description: 'Every business is vetted to ensure quality connections and long-term partnership success.'
    },
    {
      icon: FiTarget,
      title: 'Right Fit',
      description: 'No more cold outreach. Connect with businesses actively looking for partnerships like yours.'
    }
  ];

  return (
    <div className="landing-hero">
      <h1>
        Find Your Perfect<br />
        <span>Business Partner</span>
      </h1>
      <p>
        Connect with small business owners who need your expertise. 
        Whether you're great at delivery but struggle with sales, or need help scaling—we match you with the right partners.
      </p>
      <div className="buttons">
        <Link to="/register" className="btn btn-primary btn-lg">
          Get Started <FiArrowRight />
        </Link>
        <Link to="/login" className="btn btn-secondary btn-lg">
          Sign In
        </Link>
      </div>

      <section className="landing-features" style={{ width: '100%', marginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>How It Works</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Three simple steps to find your perfect business partnership
          </p>
          
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <feature.icon />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '80px 40px', width: '100%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>
            Ready to Scale Your Business?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '18px' }}>
            Join hundreds of business owners who've found their perfect partnership match
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Your Journey <FiArrowRight />
          </Link>
        </div>
      </section>

      <footer style={{ padding: '40px', borderTop: '1px solid var(--border)', width: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>© 2026 PartnerSync. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;