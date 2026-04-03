import type { EmailPlatformAdapter } from './adapters/types';
import type { EmailData } from '../shared/types';

export type EmailChangeCallback = (emailData: EmailData) => void;

export class EmailWatcher {
  private adapter: EmailPlatformAdapter;
  private callback: EmailChangeCallback;
  private observer: MutationObserver | null = null;
  private lastEmailKey: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(adapter: EmailPlatformAdapter, callback: EmailChangeCallback) {
    this.adapter = adapter;
    this.callback = callback;
  }

  start(): void {
    const target = this.adapter.getWatchTarget();
    if (!target) {
      console.warn('PhishSense: Watch target not found, retrying in 2s...');
      setTimeout(() => this.start(), 2000);
      return;
    }

    this.observer = new MutationObserver(() => this.onMutation());
    this.observer.observe(target, { childList: true, subtree: true });
    console.log('PhishSense: EmailWatcher started.');

    // Check if an email is already open
    this.checkForNewEmail();
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.lastEmailKey = null;
    console.log('PhishSense: EmailWatcher stopped.');
  }

  private onMutation(): void {
    // Debounce rapid DOM changes (e.g. Outlook SPA transitions)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.checkForNewEmail(), 300);
  }

  private checkForNewEmail(): void {
    if (!this.adapter.isEmailOpen()) return;

    const emailData = this.adapter.readEmail();
    if (!emailData) return;

    const key = this.computeKey(emailData);
    if (key === this.lastEmailKey) return; // Same email, skip

    this.lastEmailKey = key;
    this.callback(emailData);
  }

  private computeKey(email: EmailData): string {
    return `${email.sender}|${email.subject}|${email.body.slice(0, 100)}`;
  }
}
