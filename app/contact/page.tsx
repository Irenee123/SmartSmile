'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    email: '',
    category: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#f0f0f0', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 100,
        background: 'rgba(8,8,8,0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 5%'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}>
          <Link href="/" style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            SmartSmile
          </Link>
          <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            <li><Link href="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '.9rem' }}>About</Link></li>
            <li><Link href="/contact" style={{ color: '#f0f0f0', textDecoration: 'none', fontSize: '.9rem' }}>Contact</Link></li>
          </ul>
          <Link href="/signup" style={{
            background: '#00e5ff',
            color: '#000',
            padding: '.5rem 1.2rem',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '.85rem',
            textDecoration: 'none'
          }}>
            Start Screening
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '140px 5% 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, rgba(168,85,247,0.05) 50%, transparent 70%)',
          top: 0,
          right: '-100px',
          pointerEvents: 'none'
        }}></div>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: '#00e5ff', marginBottom: '.8rem' }}>
            Get In Touch
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            marginBottom: '1rem',
            lineHeight: 1.1
          }}>
            We'd love to<br />
            <span style={{
              background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>hear from you</span>
          </h1>
          <p style={{ color: '#666', maxWidth: '500px', lineHeight: 1.7, fontSize: '1rem', marginBottom: '3rem' }}>
            Have a question about SmartSmile, need support, or want to share feedback? Reach out — we typically respond within 2 business days.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <section style={{ padding: '0 5% 100px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>

            {/* Left: Info Cards */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  transition: 'border-color .3s'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    background: 'rgba(0,229,255,0.1)',
                    border: '1px solid rgba(0,229,255,0.15)'
                  }}>✉️</div>
                  <div>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', marginBottom: '.3rem' }}>General Support</h4>
                    <p style={{ color: '#666', fontSize: '.83rem', lineHeight: 1.6, margin: 0 }}>
                      For platform questions, account help, or general enquiries:<br />
                      <a href="mailto:support@smartsmile.ai" style={{ color: '#00e5ff', textDecoration: 'none' }}>support@smartsmile.ai</a>
                    </p>
                  </div>
                </div>

                <div style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  transition: 'border-color .3s'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    background: 'rgba(168,85,247,0.1)',
                    border: '1px solid rgba(168,85,247,0.15)'
                  }}>🔒</div>
                  <div>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', marginBottom: '.3rem' }}>Privacy & Data Requests</h4>
                    <p style={{ color: '#666', fontSize: '.83rem', lineHeight: 1.6, margin: 0 }}>
                      For data access, correction, or deletion requests:<br />
                      <a href="mailto:privacy@smartsmile.ai" style={{ color: '#00e5ff', textDecoration: 'none' }}>privacy@smartsmile.ai</a>
                    </p>
                  </div>
                </div>

                <div style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  transition: 'border-color .3s'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid rgba(249,115,22,0.15)'
                  }}>⚖️</div>
                  <div>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', marginBottom: '.3rem' }}>Legal Enquiries</h4>
                    <p style={{ color: '#666', fontSize: '.83rem', lineHeight: 1.6, margin: 0 }}>
                      For terms, licensing, or legal matters:<br />
                      <a href="mailto:legal@smartsmile.ai" style={{ color: '#00e5ff', textDecoration: 'none' }}>legal@smartsmile.ai</a>
                    </p>
                  </div>
                </div>

                <div style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '1.4rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  transition: 'border-color .3s'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    minWidth: '42px',
                    borderRadius: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    background: 'rgba(52,211,153,0.1)',
                    border: '1px solid rgba(52,211,153,0.15)'
                  }}>🤖</div>
                  <div>
                    <h4 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '.9rem', marginBottom: '.3rem' }}>AI & Research</h4>
                    <p style={{ color: '#666', fontSize: '.83rem', lineHeight: 1.6, margin: 0 }}>
                      For questions about the AI model, accuracy, or research collaboration:<br />
                      <a href="mailto:research@smartsmile.ai" style={{ color: '#00e5ff', textDecoration: 'none' }}>research@smartsmile.ai</a>
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '.5rem',
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.15)',
                borderRadius: '100px',
                padding: '.4rem 1rem',
                fontSize: '.78rem',
                color: '#34d399',
                marginTop: '1.5rem'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#34d399',
                  animation: 'pulse 2s infinite'
                }}></span>
                Typical response time: 1–2 business days
              </div>
            </div>

            {/* Right: Form */}
            <div>
              {!submitted ? (
                <div style={{
                  background: '#111',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px',
                  padding: '2.5rem'
                }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', marginBottom: '.3rem' }}>
                    Send a Message
                  </h3>
                  <p style={{ color: '#666', fontSize: '.85rem', marginBottom: '1.8rem' }}>
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '.82rem', color: '#666', marginBottom: '.4rem', fontWeight: 500 }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px',
                            padding: '.75rem 1rem',
                            color: '#f0f0f0',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '.9rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '.82rem', color: '#666', marginBottom: '.4rem', fontWeight: 500 }}>
                          Subject Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px',
                            padding: '.75rem 1rem',
                            color: '#f0f0f0',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '.9rem',
                            outline: 'none'
                          }}
                        >
                          <option value="">Select a topic…</option>
                          <option>General Question</option>
                          <option>Account Support</option>
                          <option>Screening Result Query</option>
                          <option>Privacy / Data Request</option>
                          <option>Bug Report</option>
                          <option>Research / Partnership</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'block', fontSize: '.82rem', color: '#666', marginBottom: '.4rem', fontWeight: 500 }}>
                        Subject
                      </label>
                      <input
                        type="text"
                        placeholder="Brief description of your enquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '10px',
                          padding: '.75rem 1rem',
                          color: '#f0f0f0',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '.9rem',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.2rem' }}>
                      <label style={{ display: 'block', fontSize: '.82rem', color: '#666', marginBottom: '.4rem', fontWeight: 500 }}>
                        Message
                      </label>
                      <textarea
                        placeholder="Write your message here. Please be as detailed as possible so we can help you effectively…"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '10px',
                          padding: '.75rem 1rem',
                          color: '#f0f0f0',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '.9rem',
                          outline: 'none',
                          resize: 'vertical',
                          minHeight: '130px',
                          lineHeight: 1.6
                        }}
                      />
                    </div>

                    <div style={{
                      background: 'rgba(249,115,22,0.05)',
                      border: '1px solid rgba(249,115,22,0.12)',
                      borderRadius: '12px',
                      padding: '1rem 1.2rem',
                      marginTop: '1rem',
                      display: 'flex',
                      gap: '.75rem',
                      alignItems: 'flex-start'
                    }}>
                      <span>⚠️</span>
                      <p style={{ color: '#666', fontSize: '.78rem', lineHeight: 1.6, margin: 0 }}>
                        SmartSmile does not provide dental or medical advice through this contact form. For dental health concerns, please consult a qualified dental professional.
                      </p>
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        background: '#00e5ff',
                        color: '#000',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '.9rem',
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: '.95rem',
                        cursor: 'pointer',
                        marginTop: '.5rem'
                      }}
                    >
                      Send Message →
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(52,211,153,0.06)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: '14px',
                  padding: '2.5rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#34d399', fontSize: '1.3rem', marginBottom: '.5rem' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: '#666', fontSize: '.88rem', lineHeight: 1.65 }}>
                    Thank you for reaching out. We've received your message and will respond to your email within 1–2 business days. Please check your spam folder if you don't hear from us.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '3rem 5%' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00e5ff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            SmartSmile
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <Link href="/about" style={{ color: '#666', textDecoration: 'none', fontSize: '.85rem' }}>About</Link>
            <Link href="/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '.85rem' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#666', textDecoration: 'none', fontSize: '.85rem' }}>Terms of Service</Link>
            <Link href="/contact" style={{ color: '#666', textDecoration: 'none', fontSize: '.85rem' }}>Contact</Link>
          </div>
          <div style={{ color: '#666', fontSize: '.8rem' }}>© 2026 SmartSmile. All rights reserved.</div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(1.3); }
        }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .form-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
