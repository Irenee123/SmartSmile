'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MaintenancePage() {
  const [settings, setSettings] = useState<{ maintenance_message?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('maintenance_message')
      .single();
    
    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '2rem',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: 500,
      }}>
        {/* Icon */}
        <div style={{
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.1))',
          border: '2px solid rgba(251,191,36,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem',
          fontSize: '3rem',
        }}>
          🔧
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: '2.5rem',
          color: '#f0f0f0',
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Under Maintenance
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '1.1rem',
          color: '#888',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          {loading ? 'Loading...' : settings?.maintenance_message || 'We are currently performing scheduled maintenance. We will be back soon!'}
        </p>

        {/* Expected back time */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.05)',
          padding: '0.75rem 1.5rem',
          borderRadius: 100,
          color: '#666',
          fontSize: '0.9rem',
        }}>
          <span>⏱️</span>
          <span>Expected back: Soon</span>
        </div>

        {/* Contact info */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Need urgent help?
          </p>
          <Link 
            href="/contact"
            style={{
              color: '#fbbf24',
              textDecoration: 'none',
              fontSize: '0.9rem',
            }}
          >
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
}
