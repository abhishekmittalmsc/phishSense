import React from 'react';
import type { SidePanelData } from './types';
import { mockData } from './mockData';
import VerdictBanner from './VerdictBanner';
import RiskScoreGauge from './RiskScoreGauge';
import SenderCard from './SenderCard';
import ManipulationTacticsCard from './ManipulationTacticsCard';
import BECIndicatorsCard from './BECIndicatorsCard';
import URLVerdictList from './URLVerdictList';
import HighlightedEmailBody from './HighlightedEmailBody';
import ExplanationCard from './ExplanationCard';
import './SidePanelContainer.css';

interface SidePanelContainerProps {
  data: SidePanelData;
}

const SidePanelContainer: React.FC<SidePanelContainerProps> = ({ data }) => {
  return (
    <div className="side-panel-container">
      {/* Header row: verdict + score side by side */}
      <div className="panel-header">
        <VerdictBanner classification={data.classification} title={data.verdict.title} />
        <RiskScoreGauge score={data.score} classification={data.classification} />
      </div>

      {/* Summary */}
      <ExplanationCard explanation={data.explanation} detailedReport={data.detailedReport} />

      {/* Sender */}
      <SenderCard sender={data.sender} />

      {/* Manipulation tactics */}
      <ManipulationTacticsCard tactics={data.manipulationTactics} />

      {/* BEC indicators */}
      <BECIndicatorsCard indicators={data.becIndicators} />

      {/* URL verdicts */}
      <URLVerdictList urls={data.urls} />

      {/* Email body */}
      <HighlightedEmailBody emailBody={data.emailBody} highlightedPhrases={data.highlightedPhrases} />
    </div>
  );
};

export default SidePanelContainer;

export const MockedSidePanel: React.FC = () => {
  return <SidePanelContainer data={mockData} />;
};
