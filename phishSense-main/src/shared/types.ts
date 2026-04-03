// Email data extracted by content script
export interface EmailData {
  sender: string;
  senderName: string;
    subject: string;
    body: string;
    links: string[];
    timestamp: string;
    platform: 'gmail' | 'outlook';
}

// Analysis result from Backend API
export interface PhishAnalysisResult {
    riskScore: number; // 0-100
    verdict: 'safe' | 'suspicious' | 'phishing';
    manipulationTactics: ManipulationTactic[];
    becIndicators: string[];
    technicalFlags: string[];
    summary: string;
    detailedReport: string[];
}

export interface ManipulationTactic {   
    principle: string; // e.g. Authority, Urgency, Scarcity
    evidence: string;
    severity: 'low' | 'medium' | 'high';
}

// Message format for communication between content script and background/sidepanel
export type ExtensionMessage  =
| { type: 'SCAN_EMAIL'; emailData: EmailData; tabId?: number }
| { type: 'ANALYSIS_RESULT'; analysis: PhishAnalysisResult }
| { type: 'GET_LATEST_RESULT'; }
| { type: 'OPEN_SIDE_PANEL' }
| { type: 'READ_EMAIL' }
| { type: 'EMAIL_DATA'; emailData: EmailData | null }
| { type: 'TOGGLE_SIDEPANEL' }
| { type: 'SCAN_COMPLETE'; result: PhishAnalysisResult }
| { type: 'NEW_EMAIL_DETECTED' }
| { type: 'RESET' }

// Badge states for the injected pill badge
export type BadgeState =
  | { status: 'loading' }
  | { status: 'safe' | 'suspicious' | 'phishing'; score: number };