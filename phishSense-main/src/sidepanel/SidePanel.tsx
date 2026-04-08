import { useEffect, useState } from 'react';
import type { PhishAnalysisResult } from '../shared/types';
import { STORAGE_KEY } from '../shared/constants';
import SidePanelContainer from './SidePanelContainer';

const SidePanel = () => {
  const [data, setData] = useState<PhishAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const result = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RESULT' });
        if (result) {
          setData(result);
        }
        // If no result yet, stay on idle screen (data = null)
      } catch (e) {
        console.error('Error fetching analysis result:', e);
        setError('Could not load analysis data.');
      }
    };

    fetchLatestResult();

    // Also listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY.LATEST_RESULT]) {
        setData(changes[STORAGE_KEY.LATEST_RESULT].newValue as PhishAnalysisResult);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Reset to idle when a new email is detected in the tab
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'RESET') {
        setData(null);
        setError(null);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        <h1 className="text-lg font-bold text-red-500">Error</h1>
        <p className="text-sm text-slate-400 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold">PhishSense AI</h1>
        <p className="text-sm text-slate-400 text-center">
          New email detected. Open the popup to scan it.
        </p>
      </div>
    );
  }

  // Guard against stale storage values where verdict may be the old mockData object shape
  if (typeof data.verdict !== 'string') {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold">PhishSense AI</h1>
        <p className="text-sm text-slate-400 text-center">Open an email and scan it to see results.</p>
      </div>
    );
  }

  // Map the PhishAnalysisResult to the SidePanelData format
  // urlVerdicts is an extra field returned by our backend alongside PhishAnalysisResult
  const apiResult = data as PhishAnalysisResult & { urlVerdicts?: { url: string; verdict: string; reason: string }[] };

  const mappedUrls = apiResult.urlVerdicts && apiResult.urlVerdicts.length > 0
    ? apiResult.urlVerdicts.map(u => ({
        link: u.url,
        verdict: (u.verdict === 'Malicious' ? 'Malicious' : 'Safe') as 'Safe' | 'Malicious',
        reason: u.reason,
      }))
    : [];

  const extraData = data as unknown as { sender?: string; senderName?: string; emailBody?: string };
  const senderEmail = extraData.sender || 'Unknown';
  const senderName = extraData.senderName || '';
  const displayNameMismatch = senderName !== '' && !senderEmail.toLowerCase().includes(senderName.toLowerCase().split(' ')[0]);

  const senderData = {
    email: senderEmail,
    spf: 'Unknown' as const,
    dmarc: 'Unknown' as const,
    displayNameMismatch,
  };

  const verdictLabel = data.verdict.charAt(0).toUpperCase() + data.verdict.slice(1);

  const sidePanelData = {
    classification: verdictLabel as 'Safe' | 'Suspicious' | 'Phishing',
    score: data.riskScore,
    verdict: { title: verdictLabel, description: data.summary },
    sender: senderData,
    emailBody: extraData.emailBody || '',
    highlightedPhrases: data.manipulationTactics.map(t => t.evidence).filter(Boolean),
    urls: mappedUrls,
    explanation: data.summary,
  };

  return <SidePanelContainer data={sidePanelData} />;
};

export default SidePanel;
