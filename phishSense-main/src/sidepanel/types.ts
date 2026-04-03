export interface SidePanelData {
  score: number;
  classification: 'Safe' | 'Suspicious' | 'Phishing';
  verdict: {
    title: string;
    description: string;
  };
  emailBody: string;
  highlightedPhrases: string[];
  urls: {
    link: string;
    verdict: 'Safe' | 'Malicious';
    reason: string;
  }[];
  sender: {
    email: string;
    spf: 'Pass' | 'Fail';
    dmarc: 'Pass' | 'Fail';
    displayNameMismatch: boolean;
  };
  explanation: string;
}