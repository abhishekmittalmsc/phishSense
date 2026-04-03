import type { ExtensionMessage, PhishAnalysisResult } from '../shared/types';
import { STORAGE_KEY, API_BASE_URL } from '../shared/constants';

// Service Worker - NO DOM, NO Window, NO document here

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PhishSense AI extension installed.');
});

// Enable side panel on supported pages
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

// Message listener - central hub for all communication
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    console.log('Received message in background:', message.type);

    (async () => {
      switch (message.type) {
        case 'SCAN_EMAIL': {
          const targetTabId = message.tabId || sender.tab?.id;

          try {
            // ── Call the PhishSense backend ──────────────────────────────────
            const response = await fetch(`${API_BASE_URL}/analyze`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(message.emailData),
            });

            if (!response.ok) {
              const errBody = await response.json().catch(() => ({}));
              throw new Error((errBody as { error?: string }).error || `Backend returned ${response.status}`);
            }

            const analysis: PhishAnalysisResult = await response.json();

            // ── Store the latest result ──────────────────────────────────────
            await chrome.storage.local.set({
              [STORAGE_KEY.LATEST_RESULT]: analysis,
            });

            // ── Notify content script to update the badge ────────────────────
            if (targetTabId) {
              chrome.tabs.sendMessage(targetTabId, {
                type: 'SCAN_COMPLETE',
                result: analysis,
              }).catch(() => {
                // Content script may not be available (e.g. tab navigated away)
              });
            }

            sendResponse({ status: 'complete' });

          } catch (err: unknown) {
            const errMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('PhishSense: Backend call failed:', errMessage);

            if (targetTabId) {
              chrome.tabs.sendMessage(targetTabId, {
                type: 'SCAN_COMPLETE',
                result: {
                  riskScore: 0,
                  verdict: 'safe',
                  manipulationTactics: [],
                  becIndicators: [],
                  technicalFlags: [`Analysis failed: ${errMessage}`],
                  summary: `Could not connect to PhishSense backend. Is it running at ${API_BASE_URL}?`,
                  detailedReport: [errMessage],
                } as PhishAnalysisResult,
              }).catch(() => {});
            }

            sendResponse({ status: 'error', message: errMessage });
          }
          break;
        }

        case 'NEW_EMAIL_DETECTED': {
          // chrome.extension.getViews() is not available in MV3 service workers.
          // Broadcast a RESET so the side panel resets itself if it's open.
          chrome.runtime.sendMessage({ type: 'RESET' }).catch(() => {
            // Side panel not open — ignore
          });

          sendResponse({ status: 'ok' });
          break;
        }

        case 'GET_LATEST_RESULT': {
          const data = await chrome.storage.local.get(STORAGE_KEY.LATEST_RESULT);
          sendResponse(data[STORAGE_KEY.LATEST_RESULT] || null);
          break;
        }

        default:
          sendResponse({ status: 'not_implemented' });
      }
    })();
    return true; // Indicates we will respond asynchronously
  }
);

console.log('PhishSense AI background script loaded.');

export {};