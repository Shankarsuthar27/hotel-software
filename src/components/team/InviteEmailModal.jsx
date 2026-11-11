import React, { useState } from 'react';
import { Mail, X, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';

export default function InviteEmailModal({
  isOpen,
  onClose,
  member,
  organizationName = 'HOTEL ASTHA',
  inviterName = 'Astha India',
  onNavigateToAccept
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !member) return null;

  const propertyName = member.properties?.join(', ') || organizationName;
  const token = member.invitationToken || 'token_sample_123';
  const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenInvite = () => {
    onClose();
    if (onNavigateToAccept) {
      onNavigateToAccept(token);
    }
  };

  return (
    <div className="team-modal-overlay" onClick={onClose}>
      <div
        className="team-modal-card"
        style={{ maxWidth: '540px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="team-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="team-modal-icon-badge" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 className="team-modal-title">Invitation Email Preview</h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Sent to: <strong>{member.email}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            className="team-modal-close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="team-modal-body" style={{ backgroundColor: '#F8FAFC', padding: '20px' }}>
          {/* Simulated Email Envelope Card */}
          <div className="team-email-preview-card">
            <div className="team-email-preview-subject">
              <span style={{ color: '#64748B', fontSize: '11.5px' }}>Subject:</span>
              <strong style={{ marginLeft: '6px', color: '#0F172A', fontSize: '13px' }}>
                Welcome to {organizationName} - Team Invitation
              </strong>
            </div>

            <div className="team-email-preview-body">
              <div className="team-email-brand-logo">OTAL</div>
              <h2 className="team-email-heading">Welcome to {organizationName}</h2>
              <p className="team-email-text">
                <strong>{inviterName}</strong> has invited you to join their team on PMS.
                You&apos;ll have access to manage <strong>{propertyName}</strong> as{' '}
                <span className="team-role-pill">{member.role}</span>.
              </p>
              <p className="team-email-text" style={{ marginTop: '12px' }}>
                Click the button below to accept your invitation and activate your account.
              </p>

              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="team-email-cta-btn"
                  onClick={handleOpenInvite}
                >
                  <span>Accept Invitation</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="team-email-footer-note">
                If the button above does not work, copy and paste this verification URL into your browser:
                <div className="team-email-raw-link">{inviteUrl}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="team-modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="team-btn-copy-link"
            onClick={handleCopyLink}
          >
            {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
            <span>{copied ? 'Copied Invitation Link!' : 'Copy Direct Link'}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="team-btn-cancel"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="team-btn-submit"
              onClick={handleOpenInvite}
            >
              <ExternalLink size={14} />
              <span>Open Acceptance Flow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

