import React, { useState } from 'react';
import type { SidePanelData } from './types';
import './URLVerdictList.css';

interface URLVerdictListProps {
  urls: SidePanelData['urls'];
}

const URL_TRUNCATE_LENGTH = 60;

function truncateUrl(url: string): string {
  if (url.length <= URL_TRUNCATE_LENGTH) return url;
  return url.slice(0, URL_TRUNCATE_LENGTH) + '…';
}

const verdictConfig: Record<string, { className: string; label: string }> = {
  Malicious: { className: 'malicious', label: 'Malicious' },
  Safe:      { className: 'safe',      label: 'Safe' },
  Unknown:   { className: 'unknown',   label: 'Unknown' },
};

const URLVerdictList: React.FC<URLVerdictListProps> = ({ urls }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  if (urls.length === 0) return null;

  return (
    <div className="url-verdict-list">
      <h3>Link Analysis <span className="url-count">{urls.length}</span></h3>
      <ul>
        {urls.map((url, index) => {
          const cfg = verdictConfig[url.verdict] ?? verdictConfig.Unknown;
          const isLong = url.link.length > URL_TRUNCATE_LENGTH;
          const isExpanded = expanded[index];

          return (
            <li key={index} className={`url-item ${cfg.className}`}>
              <div className="url-info">
                <span className="url-link">
                  {isLong && !isExpanded ? truncateUrl(url.link) : url.link}
                  {isLong && (
                    <button
                      className="url-toggle"
                      onClick={() => setExpanded(prev => ({ ...prev, [index]: !prev[index] }))}
                    >
                      {isExpanded ? 'less' : 'more'}
                    </button>
                  )}
                </span>
                <span className={`url-verdict-badge ${cfg.className}`}>{cfg.label}</span>
              </div>
              {url.reason && <p className="url-reason">{url.reason}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default URLVerdictList;
