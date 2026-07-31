import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Briefcase, ArrowUpRight, DollarSign, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const { projects, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const navigate = useNavigate();

  const categories = ['All', 'Financial Products', 'Delivery Boy Hiring', 'Third Party Hiring'];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const handleApplyClick = () => {
    if (currentUser) {
      navigate('/candidate');
    } else {
      navigate('/auth?signup=true');
    }
  };

  return (
    <div className="fade-in">
      {/* Banner */}
      <div className="page-hero-banner">
        <div className="container">
          <span style={badgeStyle}>CAMPAIGNS & OPERATIONS</span>
          <h1>Our Active Projects</h1>
          <p>
            Earn high commissions onboarding users and scale delivery metrics for India's premium platforms.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section style={{ padding: '40px 24px 0 24px' }}>
        <div className="container" style={tabsContainerStyle}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                ...tabStyle,
                backgroundColor: activeFilter === cat ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.02)',
                borderColor: activeFilter === cat ? 'var(--primary-color)' : 'var(--border-color)',
                color: activeFilter === cat ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding">
        <div className="container grid-2" style={{ gap: '30px' }}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div key={project.id} className="card" style={projectCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <span style={categoryBadgeStyle}>{project.category}</span>
                  <span style={{
                    ...statusBadgeStyle,
                    backgroundColor: project.status === 'Active' ? 'var(--primary-light)' : 'rgba(255,255,255,0.05)',
                    color: project.status === 'Active' ? 'var(--primary-color)' : 'var(--text-muted)'
                  }}>{project.status}</span>
                </div>

                <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{project.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px', flexGrow: 1 }}>
                  {project.description}
                </p>

                <div style={metricsContainerStyle}>
                  <div style={metricItemStyle}>
                    <DollarSign size={18} color="var(--primary-color)" />
                    <div>
                      <div style={metricLabelStyle}>Commission Payout</div>
                      <div style={metricValueStyle}>{project.commission}</div>
                    </div>
                  </div>
                  <div style={metricItemStyle}>
                    <Users size={18} color="var(--secondary-color)" />
                    <div>
                      <div style={metricLabelStyle}>Sourcing Target</div>
                      <div style={metricValueStyle}>{project.hiringCount}+ Openings</div>
                    </div>
                  </div>
                </div>

                <button onClick={handleApplyClick} className="btn btn-outline" style={{ width: '100%', marginTop: '10px' }}>
                  Apply to Project <ArrowUpRight size={16} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              No active campaigns found in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Inline Styles
const bannerStyle = {
  background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, rgba(11, 15, 25, 0) 100%)',
  padding: '80px 24px 60px 24px',
  borderBottom: '1px solid var(--border-color)',
  textAlign: 'left'
};

const badgeStyle = {
  fontSize: '0.8rem',
  fontWeight: '800',
  color: 'var(--primary-color)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase'
};

const tabsContainerStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  justifyContent: 'flex-start'
};

const tabStyle = {
  padding: '8px 20px',
  borderRadius: 'var(--radius-full)',
  border: '1px solid',
  fontSize: '0.9rem',
  fontWeight: '600',
  transition: 'all var(--transition-fast)'
};

const projectCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  height: '100%'
};

const categoryBadgeStyle = {
  fontSize: '0.8rem',
  fontWeight: '700',
  color: 'var(--secondary-color)',
  textTransform: 'uppercase'
};

const statusBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  padding: '4px 8px',
  borderRadius: 'var(--radius-sm)'
};

const metricsContainerStyle = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '16px',
  backgroundColor: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-color)',
  padding: '16px',
  borderRadius: 'var(--radius-md)',
  marginBottom: '20px'
};

const metricItemStyle = {
  display: 'flex',
  gap: '10px',
  alignItems: 'start'
};

const metricLabelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  textTransform: 'uppercase'
};

const metricValueStyle = {
  fontSize: '0.9rem',
  fontWeight: '700',
  color: 'var(--text-primary)',
  marginTop: '2px'
};

export default Projects;
