import type { EmailData } from '../../shared/types';
import type { EmailPlatformAdapter } from './types';

export class GmailAdapter implements EmailPlatformAdapter {
  isEmailOpen(): boolean {
    return document.querySelector('[data-message-id]') !== null;
  }

  readEmail(): EmailData | null {
    const messageEl = document.querySelector('[data-message-id]');
    if (!messageEl) return null;

    // Subject is in h2.hP which is OUTSIDE the message container (it's at the thread level)
    const subjectEl = document.querySelector('h2.hP') as HTMLElement;
    // Sender's email is inside the message container
    const senderEl = messageEl.querySelector('span[email]');
    // Body is inside the message container
    const bodyEl = this.getBodyElement();

    if (!subjectEl || !senderEl || !bodyEl) return null;

    const links = Array.from(bodyEl.querySelectorAll('a[href]')).map(
      (a) => (a as HTMLAnchorElement).href
    );

    return {
      subject: subjectEl.innerText,
      sender: senderEl.getAttribute('email') || '',
      senderName: senderEl.getAttribute('name') || '',
      body: bodyEl.innerText,
      links,
      timestamp: new Date().toISOString(),
      platform: 'gmail',
    };
  }

  getBadgeTarget(): HTMLElement | null {
    // The subject h2 area is a good place for the badge
    return document.querySelector('h2.hP') as HTMLElement | null;
  }

  getBodyElement(): HTMLElement | null {
    const messageEl = document.querySelector('[data-message-id]');
    return messageEl ? (messageEl.querySelector('div.a3s') as HTMLElement) : null;
  }

  getWatchTarget(): HTMLElement | null {
    // Gmail's main content area that changes when navigating between emails
    return document.querySelector('div[role="main"]') as HTMLElement | null;
  }
}
