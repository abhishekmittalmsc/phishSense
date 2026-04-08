import React from 'react';
import type { SidePanelData } from './types';
import './ManipulationTacticsCard.css';

interface ManipulationTacticsCardProps {
  tactics: SidePanelData['manipulationTactics'];
}

const severityConfig = {
  high:   { label: 'High',   className: 'severity-high' },
  medium: { label: 'Medium', className: 'severity-medium' },
  low:    { label: 'Low',    className: 'severity-low' },
};

const principleIcons: Record<string, string> = {
  Urgency:    '⏱',
  Authority:  '🏛',
  Fear:       '😨',
  Scarcity:   '📉',
  Reciprocity:'🤝',
  Social:     '👥',
};

const ManipulationTacticsCard: React.FC<ManipulationTacticsCardProps> = ({ tactics }) => {
  if (tactics.length === 0) return null;

  return (
    <div className="manipulation-tactics-card">
      <h3>Manipulation Tactics</h3>
      <ul className="tactics-list">
        {tactics.map((tactic, i) => {
          const sev = severityConfig[tactic.severity] ?? severityConfig.low;
          const icon = principleIcons[tactic.principle] ?? '🎯';
          return (
            <li key={i} className="tactic-item">
              <div className="tactic-header">
                <span className="tactic-icon">{icon}</span>
                <span className="tactic-principle">{tactic.principle}</span>
                <span className={`severity-badge ${sev.className}`}>{sev.label}</span>
              </div>
              <p className="tactic-evidence">{tactic.evidence}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ManipulationTacticsCard;
