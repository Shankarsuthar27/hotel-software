import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Hotel,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import './accept-invite.css';

export default function AcceptInviteView({
  token,
  pmsStore,
  onAcceptSuccess,
  onNavigateHome
}) {
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Flow State: 'account_found' | 'login_form' | 'register_form' | 'success'
  const [viewStep, setViewStep] = useState('account_found');

  // Form Fields
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('+91 9292748397');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setErrorMsg('No invitation token found in URL.');
      return;
    }

    const res = pmsStore.verifyInviteToken(token);
    if (!res.valid) {
      setLoading(false);
      setErrorMsg(res.error || 'This invitation link is invalid or has expired.');
      return;
    }

    setVerification(res);
    setLoading(false);

    if (res.accountExists) {
      setViewStep('account_found');
    } else {
      setViewStep('register_form');
      if (res.name) {
        setRegisterName(res.name);
      }
    }
  }, [token, pmsStore]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!verification) return;

    const res = pmsStore.acceptInvitation({
      token,
      email: verification.email,
      password: loginPassword,
      name: verification.name
    });

    if (res.success) {
      setViewStep('success');
      setTimeout(() => {
        if (onAcceptSuccess) onAcceptSuccess(res.member);
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to accept invitation.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!verification) return;

    if (!registerName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const res = pmsStore.acceptInvitation({
      token,
      email: verification.email,
      name: registerName.trim(),
      phone: registerPhone.trim(),
      password: registerPassword
    });

    if (res.success) {
      setViewStep('success');
      setTimeout(() => {
        if (onAcceptSuccess) onAcceptSuccess(res.member);
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to complete registration.');
    }
  };

  if (loading) {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="accept-invite-spinner" />
          <h3 style={{ marginTop: '16px', fontSize: '16px', color: '#0F172A' }}>Verifying Invitation...</h3>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Validating your secure team access token.</p>
        </div>
      </div>
    );
  }

  if (errorMsg && !verification) {
    return (
      <div className="accept-invite-container">
        <div className="accept-invite-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="accept-invite-icon-circle" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ marginTop: '16px', fontSize: '18px', color: '#0F172A', fontWeight: 700 }}>
            Invitation Expired or Invalid
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px', lineHeight: 1.5 }}>
            {errorMsg}
          </p>
          <button
            type="button"
            className="accept-invite-btn-primary"
            style={{ marginTop: '20px' }}
            onClick={onNavigateHome}
          >
            Return to PMS Dashboard
          </button>
        </div>
      </div>
    );
  }

  const email = verification?.email || '';
  const orgName = verification?.organizationName || 'HOTEL ASTHA';
  const propertiesText = verification?.properties?.join(', ') || orgName;
  const roleName = verification?.role || 'Team Member';

  return (
    <div className="accept-invite-container">
      {/* Hospitality Hero Left Panel */}
      <div className="accept-invite-left-hero">
        <div className="accept-invite-hero-overlay" />
        <div className="accept-invite-hero-content">
          <div className="accept-invite-brand-badge">
            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              OTAL
            </span>
          </div>
          <h1 className="accept-invite-hero-title">
            Enterprise Multi-Property Hospitality Management
          </h1>
          <p className="accept-invite-hero-desc">
            Seamless front-desk operations, real-time tape charts, automated night audit, and granular role-based access control.
          </p>
          <div className="accept-invite-hero-property-card">
            <Hotel size={20} color="#93C5FD" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>{orgName}</div>
              <div style={{ fontSize: '12px', color: '#BFDBFE' }}>{propertiesText}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Card Right Panel */}
      <div className="accept-invite-right-panel">
        <div className="accept-invite-card">
          {/* STEP 1: Account Found Card */}
          {viewStep === 'account_found' && (
            <div>
              <div className="accept-invite-icon-circle" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <User size={26} />
              </div>

              <h2 className="accept-invite-card-title">Account Found</h2>
              <p className="accept-invite-card-desc">
                An account with <strong style={{ color: '#0F172A' }}>{email}</strong> already exists.
                Please log in to your account to accept this invitation.
              </p>

              <div className="accept-invite-meta-box">
                <div className="accept-invite-meta-row">
                  <span className="accept-invite-meta-label">Invited Property:</span>
                  <span className="accept-invite-meta-val">{propertiesText}</span>
                </div>
                <div className="accept-invite-meta-row">
                  <span className="accept-invite-meta-label">Assigned Role:</span>
                  <span className="accept-invite-role-badge">{roleName}</span>
                </div>
              </div>

              <button
                type="button"
                className="accept-invite-btn-primary"
                onClick={() => setViewStep('login_form')}
              >
                <span>Log In to Accept</span>
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  type="button"
                  className="accept-invite-link-btn"
                  onClick={onNavigateHome}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Pre-filled Locked Login Form (Prevents Browser Autofill Mismatch) */}
          {viewStep === 'login_form' && (
            <div>
              <div className="accept-invite-icon-circle" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                <KeyRound size={26} />
              </div>

              <h2 className="accept-invite-card-title">Log In to Accept</h2>
              <p className="accept-invite-card-desc">
                Enter your password for <strong style={{ color: '#0F172A' }}>{email}</strong> to activate access to{' '}
                <strong>{propertiesText}</strong>.
              </p>

              <form onSubmit={handleLoginSubmit} style={{ marginTop: '20px' }}>
                {/* Email Input: LOCKED & READONLY to Invited Email */}
                <div className="accept-invite-form-group">
                  <label className="accept-invite-label">Email Address (Locked)</label>
                  <div className="accept-invite-input-wrap">
                    <Mail size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="accept-invite-input locked"
                      title="This email is locked to match your invitation"
                    />
                    <Lock size={14} color="#94A3B8" style={{ position: 'absolute', right: '12px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                    Locked to invited recipient to prevent credential mismatch.
                  </span>
                </div>

                {/* Password Input */}
                <div className="accept-invite-form-group" style={{ marginTop: '16px' }}>
                  <label className="accept-invite-label">Password</label>
                  <div className="accept-invite-input-wrap">
                    <Lock size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="accept-invite-input"
                      placeholder="Enter your account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="accept-invite-btn-eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="accept-invite-error-box">
                    <AlertTriangle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="accept-invite-btn-primary"
                  style={{ marginTop: '24px' }}
                >
                  <span>Log In & Accept Invitation</span>
                  <ArrowRight size={16} />
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    className="accept-invite-link-btn"
                    onClick={() => setViewStep('account_found')}
                  >
                    &larr; Back to Account Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Complete Your Profile (New User Registration) */}
          {viewStep === 'register_form' && (
            <div>
              <div className="accept-invite-icon-circle" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                <User size={26} />
              </div>

              <h2 className="accept-invite-card-title">Complete Your Profile</h2>
              <p className="accept-invite-card-desc">
                Set up your details to accept your invitation to manage <strong>{propertiesText}</strong> as{' '}
                <span className="accept-invite-role-badge">{roleName}</span>.
              </p>

              <form onSubmit={handleRegisterSubmit} style={{ marginTop: '20px' }}>
                <div className="accept-invite-form-group">
                  <label className="accept-invite-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
                  <div className="accept-invite-input-wrap">
                    <User size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type="text"
                      className="accept-invite-input"
                      placeholder="e.g. Shankar Suthar"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="accept-invite-form-group" style={{ marginTop: '14px' }}>
                  <label className="accept-invite-label">Email Address (Locked)</label>
                  <div className="accept-invite-input-wrap">
                    <Mail size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="accept-invite-input locked"
                    />
                    <Lock size={14} color="#94A3B8" style={{ position: 'absolute', right: '12px' }} />
                  </div>
                </div>

                <div className="accept-invite-form-group" style={{ marginTop: '14px' }}>
                  <label className="accept-invite-label">Phone Number</label>
                  <div className="accept-invite-input-wrap">
                    <Phone size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type="tel"
                      className="accept-invite-input"
                      placeholder="+91 92927 48397"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="accept-invite-form-group" style={{ marginTop: '14px' }}>
                  <label className="accept-invite-label">Create Password <span style={{ color: '#EF4444' }}>*</span></label>
                  <div className="accept-invite-input-wrap">
                    <Lock size={16} color="#64748B" className="accept-invite-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="accept-invite-input"
                      placeholder="Set account password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="accept-invite-btn-eye"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="accept-invite-error-box">
                    <AlertTriangle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="accept-invite-btn-primary"
                  style={{ marginTop: '22px' }}
                >
                  <span>Create Account & Accept Invitation</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Success Transition */}
          {viewStep === 'success' && (
            <div style={{ textAlign: 'center', padding: '24px 10px' }}>
              <div className="accept-invite-icon-circle" style={{ backgroundColor: '#ECFDF5', color: '#059669', margin: '0 auto' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 className="accept-invite-card-title" style={{ marginTop: '16px' }}>
                Invitation Accepted!
              </h2>
              <p className="accept-invite-card-desc">
                Welcome to the team! You now have access to manage <strong>{propertiesText}</strong> as{' '}
                <span className="accept-invite-role-badge">{roleName}</span>.
              </p>
              <div className="accept-invite-spinner" style={{ margin: '24px auto 0' }} />
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '10px' }}>
                Redirecting to your PMS Dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

