import React from 'react';
import type { SidePanelData } from './types';
import './RiskScoreGauge.css';

interface RiskScoreGaugeProps {
  score: number;
  classification: SidePanelData['classification'];
}

const classificationColors = {
  Safe: '#2b7533',
  Suspicious: '#946800',
  Phishing: '#c42626',
};

const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ score, classification }) => {
  const color = classificationColors[classification];
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-score-gauge">
      <svg className="gauge-svg" width="120" height="120" viewBox="0 0 100 100">
        <circle
          className="gauge-background"
          cx="50"
          cy="50"
          r="45"
        />
        <circle
          className="gauge-foreground"
          cx="50"
          cy="50"
          r="45"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          className="gauge-text"
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill={color}
        >
          {score}
        </text>
      </svg>
    </div>
  );
};

export default RiskScoreGauge;