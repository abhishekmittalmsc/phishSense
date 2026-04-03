import { Router } from 'express';
import { analyzeEmail } from '../services/aiAnalysis.js';
import { checkUrls } from '../services/virusTotal.js';

export const analyzeRouter = Router();

/**
 * POST /analyze
 *
 * Request body: EmailData
 * {
 *   sender: string,
 *   senderName: string,
 *   subject: string,
 *   body: string,
 *   links: string[],
 *   timestamp: string,
 *   platform: 'gmail' | 'outlook'
 * }
 *
 * Response: PhishAnalysisResult (+ urlVerdicts added)
 */
analyzeRouter.post('/', async (req, res) => {
  const emailData = req.body;

  // ── Validate input ──────────────────────────────────────────────────────────
  if (!emailData || typeof emailData !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object.' });
  }

  const required = ['sender', 'subject', 'body', 'platform'];
  const missing = required.filter(f => !emailData[f]);
  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  if (!['gmail', 'outlook'].includes(emailData.platform)) {
    return res.status(400).json({ error: 'platform must be "gmail" or "outlook"' });
  }

  console.log(`\n[Analyze] New request — platform: ${emailData.platform}, sender: ${emailData.sender}`);

  try {
    // ── Run AI analysis and URL checks in parallel ──────────────────────────
    const [aiResult, urlVerdicts] = await Promise.all([
      analyzeEmail(emailData),
      checkUrls(emailData.links || []),
    ]);

    // ── Merge URL verdicts into technicalFlags ──────────────────────────────
    const maliciousUrls = urlVerdicts.filter(u => u.verdict === 'Malicious');
    if (maliciousUrls.length > 0) {
      aiResult.technicalFlags = aiResult.technicalFlags || [];
      maliciousUrls.forEach(u => {
        aiResult.technicalFlags.push(`Malicious URL detected by VirusTotal: ${u.url}`);
      });

      // Bump risk score if VT found malicious URLs and AI didn't catch it
      if (aiResult.riskScore < 70 && maliciousUrls.length > 0) {
        aiResult.riskScore = Math.min(100, aiResult.riskScore + 25);
        aiResult.verdict = aiResult.riskScore >= 70 ? 'phishing' : 'suspicious';
      }
    }

    // ── Build final response ────────────────────────────────────────────────
    const response = {
      ...aiResult,
      urlVerdicts, // Extra field for the sidepanel URL verdict list
      emailBody: emailData.body, // Echo back so the sidepanel can display the actual email
    };

    console.log(`[Analyze] Done — verdict: ${response.verdict}, score: ${response.riskScore}, urls checked: ${urlVerdicts.length}`);

    return res.json(response);

  } catch (err) {
    console.error('[Analyze] Error:', err);
    return res.status(500).json({ error: 'Analysis failed', message: err.message });
  }
});

/**
 * GET /analyze/health
 * Quick check that the analyze service is up
 */
analyzeRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    aiProvider: process.env.AI_PROVIDER || 'mock',
    virusTotalConfigured: !!(process.env.VIRUSTOTAL_API_KEY && process.env.VIRUSTOTAL_API_KEY !== 'your_virustotal_api_key_here'),
  });
});
