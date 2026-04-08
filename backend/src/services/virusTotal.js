/**
 * VirusTotal URL Reputation Service
 * Checks URLs extracted from emails against the VirusTotal API v3
 * Free tier: 4 requests/min, 500 requests/day
 */

const VT_API_BASE = 'https://www.virustotal.com/api/v3';

/**
 * Check a single URL against VirusTotal
 * @param {string} url
 * @returns {Promise<{ url: string, verdict: 'Safe' | 'Malicious' | 'Unknown', reason: string, stats?: object }>}
 */
async function checkUrl(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY || '0f01391295093f9102d67170b1453c28bb4976fdfbfe2d64e4bcd19437ad42bd';

  if (!apiKey) {
    return { url, verdict: 'Unknown', reason: 'VirusTotal API key not configured.' };
  }

  try {
    // VT API v3 requires the URL to be base64url-encoded (no padding)
    const urlId = Buffer.from(url).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const response = await fetch(`${VT_API_BASE}/urls/${urlId}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (response.status === 404) {
      // URL not in VT database — submit it for scanning
      return await submitAndCheck(url, apiKey);
    }

    if (!response.ok) {
      throw new Error(`VirusTotal API error: ${response.status}`);
    }

    const data = await response.json();
    return parseVtResult(url, data);

  } catch (err) {
    console.error(`[VirusTotal] Error checking ${url}:`, err.message);
    return { url, verdict: 'Unknown', reason: `Could not check URL: ${err.message}` };
  }
}

/**
 * Submit a new URL to VT for scanning, then fetch its report
 */
async function submitAndCheck(url, apiKey) {
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const submitRes = await fetch(`${VT_API_BASE}/urls`, {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!submitRes.ok) {
      throw new Error(`Submit failed: ${submitRes.status}`);
    }

    // VT returns an analysis ID — fetch the result
    const submitData = await submitRes.json();
    const analysisId = submitData.data?.id;
    if (!analysisId) throw new Error('No analysis ID returned');

    // Wait a moment for VT to process
    await new Promise(r => setTimeout(r, 3000));

    const analysisRes = await fetch(`${VT_API_BASE}/analyses/${analysisId}`, {
      headers: { 'x-apikey': apiKey },
    });

    if (!analysisRes.ok) throw new Error(`Analysis fetch failed: ${analysisRes.status}`);

    const analysisData = await analysisRes.json();
    const stats = analysisData.data?.attributes?.stats;

    if (!stats) return { url, verdict: 'Unknown', reason: 'Analysis still pending.' };

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    if (malicious > 0) {
      return { url, verdict: 'Malicious', reason: `Flagged by ${malicious}/${total} security vendors.`, stats };
    }
    if (suspicious > 0) {
      return { url, verdict: 'Malicious', reason: `Marked suspicious by ${suspicious}/${total} vendors.`, stats };
    }
    return { url, verdict: 'Safe', reason: `Clean — 0/${total} vendors flagged this URL.`, stats };

  } catch (err) {
    return { url, verdict: 'Unknown', reason: `Scan error: ${err.message}` };
  }
}

/**
 * Parse a VirusTotal URL report into our verdict format
 */
function parseVtResult(url, data) {
  const stats = data.data?.attributes?.last_analysis_stats;

  if (!stats) {
    return { url, verdict: 'Unknown', reason: 'No analysis data available.' };
  }

  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  if (malicious > 2) {
    return { url, verdict: 'Malicious', reason: `Flagged by ${malicious}/${total} security vendors.`, stats };
  }
  if (malicious > 0 || suspicious > 2) {
    return { url, verdict: 'Malicious', reason: `Flagged by ${malicious + suspicious}/${total} vendors as malicious/suspicious.`, stats };
  }

  return { url, verdict: 'Safe', reason: `Clean — ${malicious}/${total} vendors flagged this URL.`, stats };
}

/**
 * Check multiple URLs in parallel (with concurrency limit to respect VT rate limits)
 * @param {string[]} urls
 * @returns {Promise<Array>}
 */
export async function checkUrls(urls) {
  if (!urls || urls.length === 0) return [];

  // Deduplicate
  const uniqueUrls = [...new Set(urls)];

  // Filter out obvious internal/tracker links
  const filtered = uniqueUrls.filter(url => {
    try {
      const { hostname } = new URL(url);
      // Skip localhost, empty, and chrome internal links
      return !hostname.includes('localhost') && !url.startsWith('chrome://');
    } catch {
      return false;
    }
  });

  if (filtered.length === 0) return [];

  // Check up to 5 URLs max (rate limit protection for free tier)
  const urlsToCheck = filtered.slice(0, 5);

  console.log(`[VirusTotal] Checking ${urlsToCheck.length} URLs...`);

  // Check one at a time to stay within free-tier rate limits
  const results = [];
  for (const url of urlsToCheck) {
    const result = await checkUrl(url);
    results.push(result);
  }

  return results;
}
