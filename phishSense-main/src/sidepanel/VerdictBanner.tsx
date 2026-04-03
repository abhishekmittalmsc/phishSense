import React from 'react';
import type { SidePanelData } from './types';
import './VerdictBanner.css';

interface VerdictBannerProps {
  classification: SidePanelData['classification'];
  title: string;
}

const classificationStyles = {
  Safe: {
    backgroundColor: '#e7f5e8',
    color: '#2b7533',
    icon: '✅',
  },
  Suspicious: {
    backgroundColor: '#fffbe6',
    color: '#946800',
    icon: '⚠️',
  },
  Phishing: {
    backgroundColor: '#fdecea',
    color: '#c42626',
    icon: '⛔️',
  },
};

const VerdictBanner: React.FC<VerdictBannerProps> = ({ classification, title }) => {
  const style = classificationStyles[classification];

  return (
    <div className="verdict-banner" style={{ backgroundColor: style.backgroundColor, color: style.color }}>
      <span className="verdict-icon">{style.icon}</span>
      <h2 className="verdict-title">{title}</h2>
    </div>
  );
};

export default VerdictBanner;