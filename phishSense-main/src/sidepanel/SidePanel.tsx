import { useEffect, useState } from 'react';
import type { PhishAnalysisResult } from '../shared/types';
import { STORAGE_KEY } from '../shared/constants';
import SidePanelContainer from './SidePanelContainer';

const SidePanel = () => {
  const [data, setData] = useState<PhishAnalysisResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanCurrentEmail = async () => {
    setScanning(true);
    setError(null);
    setData(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found.');

      let readResponse;
      try {
        readResponse = await chrome.tabs.sendMessage(tab.id, { type: 'READ_EMAIL' });
      } catch {
        throw new Error('Content script not ready. Please reload the page.');
      }

      if (!readResponse?.emailData) throw new Error('No email is currently open.');

      chrome.runtime.sendMessage({ type: 'SCAN_EMAIL', emailData: readResponse.emailData, tabId: tab.id });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed.');
      setScanning(false);
    }
  };

  useEffect(() => {
    // Load any existing result from storage on open
    const fetchLatestResult = async () => {
      try {
        const result = await chrome.runtime.sendMessage({ type: 'GET_LATEST_RESULT' });
        if (result && typeof result.verdict === 'string') {
          setData(result);
        } else {
          // No prior result — auto-scan the currently open email
          scanCurrentEmail();
        }
      } catch (e) {
        console.error('Error fetching analysis result:', e);
        scanCurrentEmail();
      }
    };

    fetchLatestResult();

    // Listen for storage changes (scan result arrived)
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && changes[STORAGE_KEY.LATEST_RESULT]) {
        setData(changes[STORAGE_KEY.LATEST_RESULT].newValue as PhishAnalysisResult);
        setScanning(false);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    // When a new email is detected, auto-scan it
    const handleMessage = (message: { type: string }) => {
      if (message.type === 'RESET') {
        scanCurrentEmail();
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  if (scanning) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold">PhishSense AI</h1>
        <p className="text-sm text-slate-400 text-center">Scanning email...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold text-red-500">Scan Failed</h1>
        <p className="text-sm text-slate-400 mt-1 text-center">{error}</p>
        <button
          onClick={scanCurrentEmail}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center gap-3">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-lg font-bold">PhishSense AI</h1>
        <p className="text-sm text-slate-400 text-center">Open an email to get started.</p>
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
