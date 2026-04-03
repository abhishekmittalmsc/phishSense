import React from 'react';
import type { SidePanelData } from './types';
import './URLVerdictList.css';

interface URLVerdictListProps {
  urls: SidePanelData['urls'];
}

const URLVerdictList: React.FC<URLVerdictListProps> = ({ urls }) => {
  return (
    <div className="url-verdict-list">
      <h3>Link Analysis</h3>
      <ul>
        {urls.map((url, index) => (
          <li key={index} className={`url-item ${url.verdict.toLowerCase()}`}>
            <div className="url-info">
              <span className="url-link">{url.link}</span>
              <span className="url-verdict">{url.verdict}</span>
            </div>
            <p className="url-reason">{url.reason}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default URLVerdictList;