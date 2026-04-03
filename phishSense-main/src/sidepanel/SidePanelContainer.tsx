import React from 'react';
import type { SidePanelData } from './types';
import { mockData } from './mockData';
import VerdictBanner from './VerdictBanner';
import RiskScoreGauge from './RiskScoreGauge';
import HighlightedEmailBody from './HighlightedEmailBody';
import URLVerdictList from './URLVerdictList';
import SenderCard from './SenderCard';
import ExplanationCard from './ExplanationCard';
import './SidePanelContainer.css';

interface SidePanelContainerProps {
  data: SidePanelData;
}

const SidePanelContainer: React.FC<SidePanelContainerProps> = ({ data }) => {
  return (
    <div className="side-panel-container">
      <VerdictBanner classification={data.classification} title={data.verdict.title} />
      <RiskScoreGauge score={data.score} classification={data.classification} />
      <SenderCard sender={data.sender} />
      <HighlightedEmailBody emailBody={data.emailBody} highlightedPhrases={data.highlightedPhrases} />
      <URLVerdictList urls={data.urls} />
      <ExplanationCard explanation={data.explanation} />
    </div>
  );
};

export default SidePanelContainer;

// Example of how to use the component with mock data
export const MockedSidePanel: React.FC = () => {
  return <SidePanelContainer data={mockData} />;
};