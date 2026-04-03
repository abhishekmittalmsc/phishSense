import type { EmailPlatformAdapter } from './types';
import { GmailAdapter } from './GmailAdapter';
import { OutlookAdapter } from './OutlookAdapter';

export const createPlatformAdapter = (): EmailPlatformAdapter | null => {
  const { hostname } = window.location;

  if (hostname === 'mail.google.com') {
    return new GmailAdapter();
  }

  if (hostname.includes('outlook.')) {
    return new OutlookAdapter();
  }

  return null;
};