import React from 'react';
import type { SidePanelData } from './types';
import './SenderCard.css';

interface SenderCardProps {
  sender: SidePanelData['sender'];
}

const SenderCard: React.FC<SenderCardProps> = ({ sender }) => {
  return (
    <div className="sender-card">
      <h3>Sender Analysis</h3>
      <div className="sender-info">
        <span className="sender-label">Email:</span>
        <span className="sender-value">{sender.email}</span>
      </div>
      <div className="sender-auth">
        <div className={`auth-status ${sender.spf.toLowerCase()}`}>
          <span className="auth-label">SPF:</span>
          <span className="auth-value">{sender.spf}</span>
        </div>
        <div className={`auth-status ${sender.dmarc.toLowerCase()}`}>
          <span className="auth-label">DMARC:</span>
          <span className="auth-value">{sender.dmarc}</span>
        </div>
      </div>
      {sender.displayNameMismatch && (
        <div className="mismatch-warning">
          ⚠️ Display name does not match sender address.
        </div>
      )}
    </div>
  );
};

export default SenderCard;