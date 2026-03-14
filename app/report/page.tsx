'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Screening {
  id: string;
  created_at: string;
  risk_level: string;
  confidence_score: number;
  overall_condition: string;
  indicators: string[];
  summary: string;
  image_url?: string;
}

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check maintenance mode - but allow admins to access
    if (mounted) {
      const isAdmin = typeof window !== 'undefined' && 
        (localStorage.getItem('user_email')?.includes('admin') || 
         localStorage.getItem('user_email') === 'admin@smartsmile.com');
      const maintenanceMode = localStorage.getItem('maintenance_mode') === 'true';
      if (maintenanceMode && !isAdmin) {
        router.push('/maintenance');
        return;
      }
    }
    
    if (userId) {
      fetchData();
    }
  }, [userId, mounted, router]);

  const fetchData = async () => {
    if (!userId) return;

    // Fetch user info
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || 'User');
    }

    // Fetch screenings
    const { data } = await supabase
      .from('screenings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      setScreenings(data);
    }
    setLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#34d399';
      case 'moderate': return '#fbbf24';
      case 'high': return '#f87171';
      default: return '#666';
    }
  };

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#34d39920';
      case 'moderate': return '#fbbf2420';
      case 'high': return '#f8717120';
      default: return '#66666620';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        Loading report...
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '40px', 
      fontFamily: 'Arial, sans-serif',
      background: '#fff',
      color: '#333',
      minHeight: '100vh'
    }}>
      {/* Print Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '10px 20px',
            background: '#00e5ff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      {/* Header */}
      <div style={{ 
        borderBottom: '3px solid #00e5ff', 
        paddingBottom: '20px', 
        marginBottom: '30px' 
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          margin: '0 0 10px 0',
          color: '#00e5ff' 
        }}>
          🦷 SmartSmile Oral Health Report
        </h1>
        <p style={{ margin: 0, color: '#666' }}>
          Generated on {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* User Info */}
      <div style={{ 
        background: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Patient Information</h2>
        <p style={{ margin: '5px 0' }}><strong>Email:</strong> {userEmail}</p>
        <p style={{ margin: '5px 0' }}><strong>Total Screenings:</strong> {screenings.length}</p>
      </div>

      {/* Summary */}
      {screenings.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Summary</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ 
              background: '#34d39920', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#34d399' }}>
                {screenings.filter(s => s.risk_level === 'low').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Low Risk</div>
            </div>
            <div style={{ 
              background: '#fbbf2420', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>
                {screenings.filter(s => s.risk_level === 'moderate').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>Moderate Risk</div>
            </div>
            <div style={{ 
              background: '#f8717120', 
              padding: '15px', 
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f87171' }}>
                {screenings.filter(s => s.risk_level === 'high').length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>High Risk</div>
            </div>
          </div>
        </div>
      )}

      {/* Screenings */}
      <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Screening Details</h2>
      
      {screenings.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No screening records found.</p>
      ) : (
        screenings.map((screening, index) => (
          <div 
            key={screening.id} 
            style={{ 
              border: '1px solid #eee', 
              borderRadius: '10px', 
              padding: '20px',
              marginBottom: '20px',
              pageBreakInside: 'avoid'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                Screening #{screenings.length - index}
              </h3>
              <span style={{ color: '#666', fontSize: '14px' }}>
                {new Date(screening.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <p style={{ margin: '5px 0' }}>
                  <strong>Risk Level:</strong>{' '}
                  <span style={{ 
                    color: getRiskColor(screening.risk_level),
                    background: getRiskBgColor(screening.risk_level),
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {screening.risk_level.toUpperCase()}
                  </span>
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Confidence:</strong> {Math.round(screening.confidence_score * 100)}%
                </p>
                <p style={{ margin: '5px 0' }}>
                  <strong>Condition:</strong> {screening.overall_condition}
                </p>
              </div>
              <div>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Indicators:</strong><br/>
                  {Array.isArray(screening.indicators) 
                    ? screening.indicators.join(', ') 
                    : screening.indicators || 'None'}
                </p>
              </div>
            </div>

            {screening.summary && (
              <div style={{ marginTop: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}><strong>Summary:</strong></p>
                <p style={{ margin: 0, fontSize: '14px' }}>{screening.summary}</p>
              </div>
            )}
          </div>
        ))
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '40px', 
        paddingTop: '20px', 
        borderTop: '1px solid #eee',
        textAlign: 'center',
        color: '#999',
        fontSize: '12px'
      }}>
        <p>This report was generated by SmartSmile Oral Health Screening System</p>
        <p>For questions or concerns, please contact your dental healthcare provider</p>
      </div>
    </div>
  );
}
