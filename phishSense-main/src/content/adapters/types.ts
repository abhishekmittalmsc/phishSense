import type { EmailData } from '../../shared/types';

export interface EmailPlatformAdapter {
  isEmailOpen(): boolean;
  readEmail(): EmailData | null;
  getBadgeTarget(): HTMLElement | null;
  getBodyElement(): HTMLElement | null;
  getWatchTarget(): HTMLElement | null;
}
