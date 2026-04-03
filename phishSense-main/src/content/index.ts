import { createPlatformAdapter } from './adapters';
import { EmailWatcher } from './watcher';
import { BadgeInjector } from './badge';
import type { PhishAnalysisResult } from '../shared/types';

console.log('PhishSense AI content script loaded.');

const adapter = createPlatformAdapter();
const badgeInjector = new BadgeInjector();

if (adapter) {
  console.log('PhishSense: Adapter loaded:', adapter.constructor.name);

  const watcher = new EmailWatcher(adapter, () => {
    console.log('PhishSense: New email detected.');
    onNewEmailDetected();
  });
  watcher.start();
} else {
  console.error('PhishSense: No adapter found for this platform.');
}

function onNewEmailDetected(): void {
  // Reset badge to default state
  badgeInjector.remove();

  // Notify background: reset side panel + open popup
  chrome.runtime.sendMessage({ type: 'NEW_EMAIL_DETECTED' }).catch((err) => {
    console.error('PhishSense: Failed to notify background of new email:', err);
  });
}

// Listen for messages from background and popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'READ_EMAIL') {
    if (!adapter) {
      sendResponse({ type: 'EMAIL_DATA', emailData: null });
      return;
    }

    if (!adapter.isEmailOpen()) {
      sendResponse({ type: 'EMAIL_DATA', emailData: null });
      return;
    }

    const emailData = adapter.readEmail();
    console.log('PhishSense: Email data read on demand:', emailData);
    sendResponse({ type: 'EMAIL_DATA', emailData });
    return;
  }

  if (message.type === 'SCAN_COMPLETE') {
    const result = message.result as PhishAnalysisResult;
    const badgeTarget = adapter?.getBadgeTarget();
    if (badgeInjector.isInDOM()) {
      badgeInjector.update({ status: result.verdict, score: result.riskScore });
    } else if (badgeTarget) {
      badgeInjector.inject(badgeTarget, { status: result.verdict, score: result.riskScore });
    }
    console.log('PhishSense: Badge updated —', result.verdict, result.riskScore);
    sendResponse({ ok: true });
  }
});

// Listen for TOGGLE_SIDEPANEL from badge click (T-09)
window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'TOGGLE_SIDEPANEL') return;
  chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
});
