import React from 'react';
import './ExplanationCard.css';

interface ExplanationCardProps {
  explanation: string;
  detailedReport: string[];
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ explanation, detailedReport }) => {
  return (
    <div className="explanation-card">
      <h3>Summary</h3>
      <p className="explanation-text">{explanation}</p>
      {detailedReport.length > 0 && (
        <ul className="report-list">
          {detailedReport.map((item, i) => (
            <li key={i} className="report-item">{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExplanationCard;
