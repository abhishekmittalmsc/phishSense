import type { EmailData } from '../../shared/types';
import type { EmailPlatformAdapter } from './types';

export class OutlookAdapter implements EmailPlatformAdapter {
  isEmailOpen(): boolean {
    return document.querySelector('#ConversationReadingPaneContainer') !== null;
  }

  readEmail(): EmailData | null {
    const container = document.querySelector('#ConversationReadingPaneContainer');
    if (!container) return null;

    // Subject is in span.JdFsz with the full text in the title attribute
    const subjectEl = container.querySelector('span.JdFsz');
    // Sender info is in span.OZZZK, format: "Name <email>"
    const senderEl = container.querySelector('span.OZZZK');
    const bodyEl = this.getBodyElement();

    if (!subjectEl || !senderEl || !bodyEl) return null;

    const subject = subjectEl.getAttribute('title') || subjectEl.textContent || '';
    const { name, email } = this.parseSender(senderEl.textContent || '');

    const links = Array.from(bodyEl.querySelectorAll('a[href]'))
      .map((a) => (a as HTMLAnchorElement).href)
      .filter((href) => href.startsWith('http'));

    return {
      subject,
      sender: email,
      senderName: name,
      body: bodyEl.innerText,
      links,
      timestamp: new Date().toISOString(),
      platform: 'outlook',
    };
  }

  getBadgeTarget(): HTMLElement | null {
    // The subject area is a good place for the badge
    const container = document.querySelector('#ConversationReadingPaneContainer');
    return container?.querySelector('span.JdFsz') as HTMLElement | null;
  }

  getBodyElement(): HTMLElement | null {
    return document.querySelector('div[aria-label="Message body"]') as HTMLElement | null;
  }

  getWatchTarget(): HTMLElement | null {
    // Outlook's reading pane area that changes when a new email is selected
    return document.querySelector('[role="main"]') as HTMLElement | null;
  }

  private parseSender(raw: string): { name: string; email: string } {
    // Format: "Samba Damerla (JIRA)<jira@snapfish-llc.atlassian.net>"
    // or: "Arpit Ajmera (V)<notifications@github.com>"
    const match = raw.match(/^(.+?)<(.+?)>$/);
    if (match) {
      return { name: match[1].trim(), email: match[2].trim() };
    }
    return { name: raw.trim(), email: '' };
  }
}
