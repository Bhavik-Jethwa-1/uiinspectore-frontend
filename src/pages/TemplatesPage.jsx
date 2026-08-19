import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';

/**
 * Templates Page - Coming Soon
 * 
 * This page is a placeholder for a future feature that will allow users
 * to start projects from pre-built templates. The feature is not yet
 * implemented, so we show a clear Coming Soon state.
 */
export default function TemplatesPage() {
  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', padding: '24px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        {/* Coming Soon Card */}
        <div className="card" style={{ padding: '56px 40px' }}>
          {/* Icon */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Clock size={28} style={{ color: 'var(--primary)' }} />
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 12
          }}>
            Templates Coming Soon
          </h1>

          {/* Description */}
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: 28,
            maxWidth: 380,
            margin: '0 auto 28px'
          }}>
            We're working on pre-built templates to help you get started faster. 
            Soon you'll be able to create projects from common UI patterns like 
            dashboards, e-commerce pages, and more.
          </p>

          {/* CTA */}
          <Link 
            to="/projects" 
            className="btn-primary"
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 8,
              padding: '11px 22px'
            }}
          >
            Create a Project Instead <ArrowRight size={14} />
          </Link>
        </div>

        {/* What to expect */}
        <div style={{ marginTop: 32 }}>
          <p style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginBottom: 16,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            What's coming
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
            gap: 12 
          }}>
            {[
              'SaaS Dashboard',
              'E-commerce Product Page',
              'Onboarding Flow',
              'Settings Page',
              'Login / Sign Up',
              'Pricing Page',
            ].map(item => (
              <div 
                key={item}
                className="card"
                style={{ 
                  padding: '12px 16px',
                  textAlign: 'left',
                  opacity: 0.6
                }}
              >
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-secondary)'
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
