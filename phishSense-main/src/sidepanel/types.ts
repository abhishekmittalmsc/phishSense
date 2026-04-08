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
    spf: 'Pass' | 'Fail' | 'Unknown';
    dmarc: 'Pass' | 'Fail' | 'Unknown';
    displayNameMismatch: boolean;
  };
  explanation: string;
}