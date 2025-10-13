// frontend/src/pages/LoginPage.tsx - Exact Remise design replica
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AxiosError } from 'axios';
import { KitchenSyncLogo } from '../components/common/KitchenSyncLogo';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      await login({ email, password });
      const from = location.state?.from?.pathname || "/"; 
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      let message = 'Login failed. Please check your credentials.';
      if (error instanceof AxiosError && error.response) {
        message = error.response.data?.message || error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      setSubmitError(message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1f2937 0%, #1e40af 50%, #7c3aed 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 24px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          {/* Custom K-Table Logo */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Inner glow effect */}
            <div style={{
              position: 'absolute',
              inset: '2px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
              borderRadius: '18px',
              pointerEvents: 'none'
            }}></div>
            <img 
              src="/k-table-logo.svg" 
              alt="KitchenSync Logo" 
              style={{ 
                width: '48px', 
                height: '48px',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                position: 'relative',
                zIndex: 1
              }}
            />
          </div>

          {/* Typography - Using Custom Wordmark with circular logo */}
          <div style={{ marginBottom: '12px' }}>
            <KitchenSyncLogo size="xlarge" variant="light" showIcon />
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '24px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#10b981',
              borderRadius: '50%',
              marginRight: '12px'
            }}></div>
            <span style={{ color: '#bfdbfe', fontSize: '14px', fontWeight: '500' }}>
              Restaurant Management Platform
            </span>
          </div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
            margin: '0 0 8px 0'
          }}>
            Professional Kitchen Portal
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            margin: '0'
          }}>
            Secure access for restaurant owners, chefs, and kitchen staff
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          padding: '40px 32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
        }}>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Username Field */}
            <div>
              <label htmlFor="username" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px'
              }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 52px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your username"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 52px 16px 52px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your password"
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                    e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '18px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.color = 'rgba(255, 255, 255, 0.7)'
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLButtonElement
                    target.style.color = 'rgba(255, 255, 255, 0.4)'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {submitError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                padding: '16px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#fecaca',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ marginRight: '12px', flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {submitError}
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <div style={{ paddingTop: '16px' }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: isLoading ? 'rgba(59, 130, 246, 0.7)' : 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    const target = e.target as HTMLButtonElement
                    target.style.transform = 'translateY(-2px)'
                    target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    const target = e.target as HTMLButtonElement
                    target.style.transform = 'translateY(0)'
                    target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div style={{ marginTop: '32px', position: 'relative' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(255, 255, 255, 0.2)'
            }}></div>
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <span style={{
                padding: '8px 24px',
                background: 'rgba(31, 41, 55, 0.8)',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                New to the system?
              </span>
            </div>
          </div>

          {/* Registration Button */}
          <div style={{ marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.background = 'rgba(255, 255, 255, 0.2)'
                target.style.transform = 'translateY(-2px)'
                target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.background = 'rgba(255, 255, 255, 0.1)'
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create New Account
              </div>
            </button>
          </div>

          {/* Security Notice */}
          <div style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{
                color: '#60a5fa',
                marginTop: '2px',
                marginRight: '12px',
                flexShrink: 0
              }}>
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div>
                <p style={{
                  color: '#bfdbfe',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: '0 0 4px 0'
                }}>
                  Secure Access
                </p>
                <p style={{
                  color: 'rgba(191, 219, 254, 0.8)',
                  fontSize: '12px',
                  margin: '0'
                }}>
                  Your connection is encrypted and secure. All data is protected with enterprise-grade security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
