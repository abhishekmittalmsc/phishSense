/**
 * AI Analysis Service
 * Analyses email content for phishing indicators.
 *
 * Currently uses a mock implementation.
 * Swap AI_PROVIDER env var to 'anthropic' | 'openai' | 'gemini' to use real AI.
 */

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildPrompt(emailData) {
  return `You are PhishSense, an expert email security analyst. Analyze the following email for phishing, social engineering, and Business Email Compromise (BEC) indicators.

EMAIL DATA:
- Platform: ${emailData.platform}
- Sender Email: ${emailData.sender}
- Sender Display Name: ${emailData.senderName}
- Subject: ${emailData.subject}
- Timestamp: ${emailData.timestamp}
- Links found: ${emailData.links.length > 0 ? emailData.links.join(', ') : 'None'}
- Body:
${emailData.body}

Respond ONLY with a valid JSON object matching this exact structure:
{
  "riskScore": <number 0-100>,
  "verdict": "<safe|suspicious|phishing>",
  "manipulationTactics": [
    { "principle": "<e.g. Urgency, Authority, Fear, Scarcity>", "evidence": "<quote or describe the specific text>", "severity": "<low|medium|high>" }
  ],
  "becIndicators": ["<indicator 1>", "<indicator 2>"],
  "technicalFlags": ["<flag 1>", "<flag 2>"],
  "summary": "<2-3 sentence plain-English summary for the user>",
  "detailedReport": ["<finding 1>", "<finding 2>", "<finding 3>"]
}

Rules:
- riskScore 0-30 = safe, 31-69 = suspicious, 70-100 = phishing
- verdict must match the riskScore range
- Be specific — quote actual text from the email body as evidence
- If no tactics found, return empty arrays
- Return ONLY the JSON, no markdown, no explanation`;
}

// ─── Mock Provider ─────────────────────────────────────────────────────────────

function mockAnalyze(emailData) {
  console.log('[AI] Using mock provider');

  // Simple heuristic scoring for a realistic mock
  let score = 10;
  const body = emailData.body.toLowerCase();
  const subject = emailData.subject.toLowerCase();

  const urgencyWords = ['urgent', 'immediately', 'action required', 'verify now', 'suspended', 'expire', 'limited time', 'click here'];
  const authorityWords = ['bank', 'paypal', 'microsoft', 'google', 'apple', 'amazon', 'irs', 'government', 'security team'];
  const threatWords = ['compromised', 'unauthorized', 'suspicious activity', 'locked', 'disabled', 'fraud'];

  urgencyWords.forEach(w => { if (body.includes(w) || subject.includes(w)) score += 12; });
  authorityWords.forEach(w => { if (body.includes(w) || subject.includes(w)) score += 8; });
  threatWords.forEach(w => { if (body.includes(w) || subject.includes(w)) score += 10; });

  // Links in body push score up
  if (emailData.links.length > 0) score += 5;
  if (emailData.links.length > 3) score += 10;

  // Display name mismatch heuristic
  const displayNameMatchesDomain = emailData.senderName &&
    emailData.sender &&
    emailData.sender.toLowerCase().includes(emailData.senderName.toLowerCase().split(' ')[0]);
  if (!displayNameMatchesDomain) score += 5;

  score = Math.min(score, 100);

  const verdict = score >= 70 ? 'phishing' : score >= 31 ? 'suspicious' : 'safe';

  const tactics = [];
  if (urgencyWords.some(w => body.includes(w) || subject.includes(w))) {
    tactics.push({ principle: 'Urgency', evidence: 'The email uses time-pressure language to force quick action without thinking.', severity: 'high' });
  }
  if (authorityWords.some(w => body.includes(w) || subject.includes(w))) {
    tactics.push({ principle: 'Authority', evidence: 'The email impersonates or references a well-known brand or institution.', severity: 'medium' });
  }
  if (threatWords.some(w => body.includes(w) || subject.includes(w))) {
    tactics.push({ principle: 'Fear', evidence: 'The email uses fear of account loss or security breach to pressure the user.', severity: 'high' });
  }

  const becIndicators = [];
  if (!displayNameMatchesDomain) becIndicators.push('Display name does not match the sender email address.');
  if (emailData.links.some(l => !l.includes(emailData.sender.split('@')[1]))) {
    becIndicators.push('Links in email point to domains different from the sender\'s domain.');
  }

  const technicalFlags = [];
  if (emailData.links.some(l => l.startsWith('http:'))) technicalFlags.push('Email contains non-HTTPS (plain HTTP) links.');
  if (emailData.links.some(l => l.includes('bit.ly') || l.includes('tinyurl') || l.includes('t.co'))) {
    technicalFlags.push('Email contains shortened URLs which can obscure the real destination.');
  }

  const summaryMap = {
    phishing: `This email shows strong signs of a phishing attempt with a risk score of ${score}/100. It uses psychological manipulation and suspicious links to deceive the recipient. Do not click any links or provide any information.`,
    suspicious: `This email has several suspicious characteristics with a risk score of ${score}/100. Proceed with caution and verify the sender's identity through official channels before taking any action.`,
    safe: `This email appears to be legitimate with a risk score of ${score}/100. No major phishing indicators were detected, though always exercise caution with unexpected emails.`,
  };

  return {
    riskScore: score,
    verdict,
    manipulationTactics: tactics,
    becIndicators,
    technicalFlags,
    summary: summaryMap[verdict],
    detailedReport: [
      `Risk score: ${score}/100 — verdict: ${verdict}.`,
      `${emailData.links.length} link(s) found in the email body.`,
      tactics.length > 0
        ? `Detected manipulation tactics: ${tactics.map(t => t.principle).join(', ')}.`
        : 'No manipulation tactics detected.',
    ],
  };
}

// ─── Anthropic Provider ────────────────────────────────────────────────────────

async function anthropicAnalyze(emailData) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(emailData) }],
  });

  const text = message.content[0].text;
  return JSON.parse(text);
}

// ─── OpenAI Provider ───────────────────────────────────────────────────────────

async function openaiAnalyze(emailData) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: buildPrompt(emailData) }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(completion.choices[0].message.content);
}

// ─── Gemini Provider ───────────────────────────────────────────────────────────

async function geminiAnalyze(emailData) {
  const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      // Force JSON output — Gemini 2.0 supports this natively
      responseMimeType: 'application/json',
      temperature: 0.1,       // Low temp = more deterministic, better for structured output
      maxOutputTokens: 1024,
    },
    // Disable safety filters that might block phishing-related content analysis
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  const result = await model.generateContent(buildPrompt(emailData));
  const response = result.response;

  // Check if Gemini blocked the response
  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason === 'SAFETY') {
    throw new Error('Gemini blocked the response due to safety filters.');
  }

  const text = response.text();

  // Strip markdown code fences just in case (older models may add them)
  const clean = text.replace(/```json\n?|\n?```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Gemini returned invalid JSON: ${clean.slice(0, 200)}`);
  }

  // Validate required fields are present
  const required = ['riskScore', 'verdict', 'summary'];
  const missing = required.filter(f => parsed[f] === undefined);
  if (missing.length > 0) {
    throw new Error(`Gemini response missing fields: ${missing.join(', ')}`);
  }

  // Normalize verdict casing just in case
  parsed.verdict = parsed.verdict.toLowerCase();

  // Ensure arrays exist even if Gemini omitted them
  parsed.manipulationTactics = parsed.manipulationTactics || [];
  parsed.becIndicators       = parsed.becIndicators       || [];
  parsed.technicalFlags      = parsed.technicalFlags      || [];
  parsed.detailedReport      = parsed.detailedReport      || [];

  return parsed;
}

// ─── ImagineTech Provider ──────────────────────────────────────────────────────

async function imagineTechAnalyze(emailData) {
  const apiUrl   = process.env.IMAGINETECH_API_URL   || 'https://aide-sdlc-backend.imagine.tech/api/v1/brownfield/chat/completions';
  const apiToken = process.env.IMAGINETECH_API_TOKEN || '';
  const model    = process.env.IMAGINETECH_MODEL     || 'giga-brain';

  console.log('[AI] Using imagineTech provider');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'user', content: buildPrompt(emailData) },
        { role: 'assistant', content: '' },
      ],
      temperature: 0.5,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => `HTTP ${response.status}`);
    throw new Error(`ImagineTech AI error ${response.status}: ${errText}`);
  }

  // Consume SSE stream and accumulate content deltas
  let fullContent = '';
  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (!trimmed.startsWith('data: ')) continue;
      try {
        const json = JSON.parse(trimmed.slice(6));
        const delta = json?.choices?.[0]?.delta?.content;
        if (typeof delta === 'string') fullContent += delta;
      } catch {
        // Skip malformed SSE lines
      }
    }
  }

  // Strip markdown fences and parse JSON
  const cleaned = fullContent.replace(/```(?:json)?\n?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end   = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in ImagineTech AI response');

  const parsed = JSON.parse(cleaned.slice(start, end + 1));

  // Normalize and fill defaults
  parsed.verdict              = (parsed.verdict || 'safe').toLowerCase();
  parsed.manipulationTactics  = parsed.manipulationTactics  || [];
  parsed.becIndicators        = parsed.becIndicators        || [];
  parsed.technicalFlags       = parsed.technicalFlags       || [];
  parsed.detailedReport       = parsed.detailedReport       || [];

  return parsed;
}

// ─── Main Export ───────────────────────────────────────────────────────────────

/**
 * Analyze email data using the configured AI provider
 * @param {object} emailData - EmailData from the Chrome extension
 * @returns {Promise<PhishAnalysisResult>}
 */
export async function analyzeEmail(emailData) {
  const provider = process.env.AI_PROVIDER || 'mock';

  console.log(`[AI] Analyzing email — provider: ${provider}, subject: "${emailData.subject}"`);

  try {
    switch (provider) {
      case 'anthropic':    return await anthropicAnalyze(emailData);
      case 'openai':       return await openaiAnalyze(emailData);
      case 'gemini':       return await geminiAnalyze(emailData);
      case 'imaginetech':  return await imagineTechAnalyze(emailData);
      case 'mock':
      default:             return mockAnalyze(emailData);
    }
  } catch (err) {
    console.error(`[AI] Provider "${provider}" failed, falling back to mock:`, err.message);
    return mockAnalyze(emailData);
  }
}
