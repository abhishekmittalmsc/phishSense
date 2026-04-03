import React from 'react';
import './ExplanationCard.css';

interface ExplanationCardProps {
  explanation: string;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ explanation }) => {
  return (
    <div className="explanation-card">
      <h3>Summary</h3>
      <p>{explanation}</p>
    </div>
  );
};

export default ExplanationCard;