import React from 'react';
import './BECIndicatorsCard.css';

interface BECIndicatorsCardProps {
  indicators: string[];
}

const BECIndicatorsCard: React.FC<BECIndicatorsCardProps> = ({ indicators }) => {
  if (indicators.length === 0) return null;

  return (
    <div className="bec-indicators-card">
      <h3>Business Email Compromise Indicators</h3>
      <ul className="bec-list">
        {indicators.map((item, i) => (
          <li key={i} className="bec-item">
            <span className="bec-dot" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BECIndicatorsCard;
