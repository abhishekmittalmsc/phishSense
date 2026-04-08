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
    verdict: 'Safe' | 'Malicious' | 'Unknown';
    reason: string;
  }[];
  sender: {
    email: string;
    senderName?: string;
    spf: 'Pass' | 'Fail' | 'Unknown';
    dmarc: 'Pass' | 'Fail' | 'Unknown';
    displayNameMismatch: boolean;
  };
  explanation: string;
  manipulationTactics: {
    principle: string;
    evidence: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  becIndicators: string[];
  detailedReport: string[];
}