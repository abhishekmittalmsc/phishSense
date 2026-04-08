import type { SidePanelData } from './types';

export const mockData: SidePanelData = {
  score: 75,
  classification: 'Suspicious',
  verdict: {
    title: 'This email is suspicious',
    description: 'We have detected elements that suggest this email may not be legitimate. Please review the details below before proceeding.',
  },
  emailBody: 'Dear user,\n\nYour account has been compromised. Please click the link below to reset your password immediately.\n\nThank you,\nSupport Team',
  highlightedPhrases: ['account has been compromised', 'click the link below'],
  urls: [
    {
      link: 'http://example-secure.com/reset',
      verdict: 'Malicious',
      reason: 'This link is a known phishing URL.',
    },
    {
      link: 'http://google.com',
      verdict: 'Safe',
      reason: 'This is a trusted and well-known domain.',
    },
  ],
  sender: {
    email: 'support@example.com',
    senderName: 'Support Team',
    spf: 'Pass',
    dmarc: 'Fail',
    displayNameMismatch: true,
  },
  explanation: 'This email creates a false sense of urgency and contains a suspicious link designed to steal your credentials. The sender display name does not match the email address, which is a common phishing tactic.',
  manipulationTactics: [
    { principle: 'Urgency', evidence: 'account has been compromised', severity: 'high' },
  ],
  becIndicators: [
    'Display name does not match the sender email address.',
  ],
  detailedReport: [
    'Risk score: 75/100 — verdict: suspicious.',
    '2 link(s) found in the email body.',
    'Detected manipulation tactics: Urgency.',
  ],
};