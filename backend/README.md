# PhishSense Backend

Node.js REST API backend for the PhishSense Chrome Extension.

## Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express
- **URL Reputation**: VirusTotal API v3
- **AI Analysis**: Pluggable — mock by default, swap to Anthropic / OpenAI / Gemini

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and fill in your API keys
npm run dev
```

Server starts on `http://localhost:8000`

## Endpoints

### `POST /analyze`
Analyzes an email for phishing indicators.

**Request body** (`EmailData`):
```json
{
  "sender": "support@suspicious-bank.com",
  "senderName": "Bank of America",
  "subject": "URGENT: Your account has been compromised",
  "body": "Dear user, click here immediately...",
  "links": ["http://steal-your-creds.xyz/reset"],
  "timestamp": "2026-04-03T10:00:00Z",
  "platform": "gmail"
}
```

**Response** (`PhishAnalysisResult`):
```json
{
  "riskScore": 87,
  "verdict": "phishing",
  "manipulationTactics": [
    { "principle": "Urgency", "evidence": "...", "severity": "high" }
  ],
  "becIndicators": ["Display name does not match sender email."],
  "technicalFlags": ["Malicious URL detected by VirusTotal: http://..."],
  "summary": "This email is a phishing attempt...",
  "detailedReport": ["..."],
  "urlVerdicts": [
    { "url": "http://steal-your-creds.xyz/reset", "verdict": "Malicious", "reason": "Flagged by 45/90 vendors." }
  ]
}
```

### `GET /health`
Returns server status.

### `GET /analyze/health`
Returns AI provider and VirusTotal configuration status.

## Switching AI Providers

Edit `.env`:

```env
# Mock (default, no API key needed)
AI_PROVIDER=mock

# Anthropic Claude
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI GPT-4o
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Google Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=AIza...
```

Then install the relevant SDK:
```bash
# Anthropic
npm install @anthropic-ai/sdk

# OpenAI
npm install openai

# Gemini
npm install @google/generative-ai
```

## VirusTotal Setup
1. Sign up free at https://www.virustotal.com
2. Go to your profile → API Key
3. Add to `.env`: `VIRUSTOTAL_API_KEY=your_key`

Free tier: 4 requests/min, 500 requests/day — sufficient for POC/hackathon use.
