import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: '*' })); // Chrome extensions call from chrome-extension:// origin
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'PhishSense Backend', timestamp: new Date().toISOString() });
});

// Routes
app.use('/analyze', analyzeRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[PhishSense] Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🛡️  PhishSense Backend running on http://localhost:${PORT}`);
  console.log(`   AI Provider : ${process.env.AI_PROVIDER || 'mock'}`);
  console.log(`   VirusTotal  : ${process.env.VIRUSTOTAL_API_KEY ? '✅ configured' : '⚠️  not set (URL checks skipped)'}\n`);
});
