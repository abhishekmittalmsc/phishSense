import { useState } from 'react';

type ScanState = 'idle' | 'scanning' | 'error' | 'no-email';

const Popup = () => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleScan = async () => {
    setScanState('scanning');
    setErrorMessage('');

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setScanState('error');
        setErrorMessage('Could not find an active tab.');
        return;
      }

      // Step 1: Open the side panel now — must happen within a user gesture context (popup click).
      await chrome.sidePanel.open({ tabId: tab.id });

      // Step 2: Tell the content script to read the email.
      let readResponse;
      try {
        readResponse = await chrome.tabs.sendMessage(tab.id, { type: 'READ_EMAIL' });
      } catch {
        setScanState('error');
        setErrorMessage('Content script not ready. Please reload the Gmail or Outlook page and try again.');
        return;
      }

      if (!readResponse?.emailData) {
        setScanState('no-email');
        setErrorMessage('No email is currently open.');
        return;
      }

      // Step 3: Send the email data to the background for analysis and close the popup.
      chrome.runtime.sendMessage({
        type: 'SCAN_EMAIL',
        emailData: readResponse.emailData,
        tabId: tab.id,
      }, () => {
        window.close();
      });

    } catch (err: unknown) {
      console.error('PhishSense Popup: Scan failed:', err);
      setScanState('error');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unknown error occurred.');
      }
    }
  };

  return (
    <div className="w-[300px] bg-slate-950 text-white p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🛡️</span>
        <div>
          <h1 className="text-lg font-bold leading-tight">PhishSense AI</h1>
          <p className="text-xs text-slate-400">Email threat detection</p>
        </div>
      </div>

      {/* Scan Button */}
      <button
        onClick={handleScan}
        disabled={scanState === 'scanning'}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-wait text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
      >
        {scanState === 'scanning' ? 'Scanning...' : 'Scan Current Email'}
      </button>

      {/* Status Messages */}
      {scanState === 'idle' && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Open an email in Gmail or Outlook, then click scan.
        </p>
      )}

      {(scanState === 'error' || scanState === 'no-email') && (
        <div className="mt-3 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-400">Scan Failed</p>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Popup;
