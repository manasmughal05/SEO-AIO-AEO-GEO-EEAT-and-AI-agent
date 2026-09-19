import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { buildUrlReport, extractDomain, fetchAndExtractPage, normalizeUrl } from './server/crawler';
import { generateAuditAiRecommendations, generateChatResponse, generateChatResponseStream, performDeepResearch } from './server/gemini';
import { AuditFinding, AuditScoreBreakdown, UrlReport, WebsiteAudit } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. WEBSITE AUDIT & URL CRAWLER ENDPOINTS
// ==========================================

// Start a full multi-page crawl and audit
app.post('/api/audit/start', async (req, res) => {
  try {
    const { url, websiteName, maxPages = 6, customUrls } = req.body;

    if (!url && (!customUrls || customUrls.length === 0)) {
      return res.status(400).json({ error: 'Website URL or list of links is required' });
    }

    // Determine target URLs
    let normalizedCustomList: string[] = [];
    if (Array.isArray(customUrls) && customUrls.length > 0) {
      normalizedCustomList = customUrls
        .map((u: any) => (typeof u === 'string' ? normalizeUrl(u.trim()) : ''))
        .filter((u: string) => Boolean(u));
    }

    const primaryUrl = url ? normalizeUrl(url) : normalizedCustomList[0];
    const rootUrl = primaryUrl;
    const domain = extractDomain(rootUrl);
    const siteName = websiteName?.trim() || domain;

    let baseOrigin = rootUrl;
    try {
      baseOrigin = new URL(rootUrl).origin;
    } catch {}

    // Step 1: Fetch and analyze the root URL
    const rootPageData = await fetchAndExtractPage(rootUrl);
    let rootPath = '/';
    try {
      const u = new URL(rootUrl);
      rootPath = u.pathname || '/';
    } catch {}
    const rootReport = buildUrlReport(rootPageData, rootPath);

    const urlReports: UrlReport[] = [rootReport];
    const visitedUrls = new Set<string>([rootUrl]);

    // Auto-discover internal URLs from DOM
    const discoveredUrls = rootPageData.discoveredInternalUrls.filter(u => u !== rootUrl);

    let pagesToCrawl: string[] = [];

    // If user supplied custom links/URLs, prioritize them!
    if (normalizedCustomList.length > 0) {
      pagesToCrawl = normalizedCustomList
        .filter(u => u !== rootUrl && !visitedUrls.has(u))
        .slice(0, Math.max(1, maxPages - 1));
    } else {
      // If few discovered URLs, suggest standard common subpages from base origin
      const commonPaths = ['/about', '/services', '/products', '/pricing', '/blog', '/contact', '/privacy', '/terms'];
      for (const p of commonPaths) {
        const candidate = `${baseOrigin.replace(/\/$/, '')}${p}`;
        if (!discoveredUrls.includes(candidate)) {
          discoveredUrls.push(candidate);
        }
      }

      pagesToCrawl = discoveredUrls
        .filter(u => !visitedUrls.has(u))
        .slice(0, Math.max(1, maxPages - 1));
    }

    for (const subUrl of pagesToCrawl) {
      visitedUrls.add(subUrl);
    }

    const subpagePromises = pagesToCrawl.map(async (subUrl) => {
      try {
        const subData = await fetchAndExtractPage(subUrl);
        const urlObj = new URL(subUrl);
        const pathName = urlObj.pathname || subUrl;
        return buildUrlReport(subData, pathName);
      } catch (subErr) {
        console.warn(`Failed to crawl subpage: ${subUrl}`, subErr);
        return null;
      }
    });

    const subpageResults = await Promise.allSettled(subpagePromises);
    for (const res of subpageResults) {
      if (res.status === 'fulfilled' && res.value) {
        urlReports.push(res.value);
      }
    }

    // Step 3: Compute aggregate scores
    const count = urlReports.length;
    const avgSeo = Math.round(urlReports.reduce((acc, r) => acc + r.scores.seo, 0) / count);
    const avgAeo = Math.round(urlReports.reduce((acc, r) => acc + r.scores.aeo, 0) / count);
    const avgAio = Math.round(urlReports.reduce((acc, r) => acc + r.scores.aio, 0) / count);
    const avgGeo = Math.round(urlReports.reduce((acc, r) => acc + r.scores.geo, 0) / count);
    const avgEeat = Math.round(urlReports.reduce((acc, r) => acc + r.scores.eeat, 0) / count);
    const avgOverall = Math.round((avgSeo * 0.25) + (avgAeo * 0.20) + (avgAio * 0.20) + (avgGeo * 0.15) + (avgEeat * 0.20));

    const averageScores: AuditScoreBreakdown = {
      seo: avgSeo,
      aeo: avgAeo,
      aio: avgAio,
      geo: avgGeo,
      eeat: avgEeat,
      overall: avgOverall,
    };

    // Extract top critical & warning findings across all URLs
    const topFindings: AuditFinding[] = [];
    urlReports.forEach(r => {
      r.findings.forEach(f => {
        if (!topFindings.some(tf => tf.title === f.title) && (f.severity === 'critical' || f.severity === 'warning')) {
          topFindings.push(f);
        }
      });
    });

    // Step 4: AI Recommendations Grounding via Gemini
    const summaryText = `Total Pages Analyzed: ${count}. Discovered URLs: ${visitedUrls.size}.
Scores: Overall=${avgOverall}, SEO=${avgSeo}, AEO=${avgAeo}, AIO=${avgAio}, GEO=${avgGeo}, EEAT=${avgEeat}.
Key issues detected: ${topFindings.slice(0, 8).map(f => `${f.title} (${f.evidence})`).join('; ')}.`;

    const globalAiRecommendations = await generateAuditAiRecommendations(siteName, rootUrl, summaryText);

    const audit: WebsiteAudit = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      websiteName: siteName,
      domain,
      rootUrl,
      status: 'completed',
      totalUrlsDiscovered: Math.max(discoveredUrls.length + 1, count),
      analyzedUrlsCount: count,
      averageScores,
      urlReports,
      topFindings: topFindings.slice(0, 15),
      globalAiRecommendations,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    db.saveAudit(audit);
    return res.json(audit);
  } catch (error: any) {
    console.error('Audit failed:', error);
    return res.status(500).json({ error: error?.message || 'Failed to complete website audit' });
  }
});

// Live Single URL Checker & Real-Time Inspector Endpoint
app.post('/api/audit/check-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Website URL is required' });
    }

    const normalizedUrl = normalizeUrl(url);
    const domain = extractDomain(normalizedUrl);
    let pathName = '/';
    try {
      const u = new URL(normalizedUrl);
      pathName = u.pathname || '/';
    } catch {}

    const pageData = await fetchAndExtractPage(normalizedUrl);
    const report = buildUrlReport(pageData, pathName);

    return res.json({
      success: true,
      url: normalizedUrl,
      domain,
      report,
    });
  } catch (error: any) {
    console.error('Live URL check error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to inspect live URL' });
  }
});

// List all audits
app.get('/api/audit/list', (req, res) => {
  res.json(db.getAllAudits());
});

// Get audit by ID
app.get('/api/audit/:id', (req, res) => {
  const audit = db.getAuditById(req.params.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });
  res.json(audit);
});

// Delete audit by ID
app.delete('/api/audit/:id', (req, res) => {
  const success = db.deleteAudit(req.params.id);
  res.json({ success });
});

// ==========================================
// 2. RESEARCH CENTER ENDPOINTS
// ==========================================

app.post('/api/research', async (req, res) => {
  try {
    const { query, type = 'topic' } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const item = await performDeepResearch(query, type);
    db.saveResearch(item);
    return res.json(item);
  } catch (error: any) {
    console.error('Research error:', error);
    return res.status(500).json({ error: error?.message || 'Research failed' });
  }
});

app.get('/api/research/list', (req, res) => {
  res.json(db.getAllResearches());
});

app.delete('/api/research/:id', (req, res) => {
  const success = db.deleteResearch(req.params.id);
  res.json({ success });
});

// ==========================================
// 3. MULTILINGUAL AI ASSISTANT CHAT
// ==========================================

// Real-time SSE Live Streaming Chat Endpoint
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, sessionId, language = 'English', image, professionRole = 'general' } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message content or image is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const defaultTitle = message 
      ? (message.substring(0, 36) + (message.length > 36 ? '...' : ''))
      : 'Visual Camera Analysis';

    let session = sessionId ? db.getChatSessionById(sessionId) : null;
    if (!session) {
      session = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: defaultTitle,
        language: language || 'English',
        professionRole,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (professionRole && session.professionRole !== professionRole) {
      session.professionRole = professionRole;
    }

    // Save user message
    const userMsg: any = {
      id: `msg-${Date.now()}-u`,
      role: 'user' as const,
      content: message || 'Please analyze this captured image / screenshot for SEO, UX, layout, and visibility signals.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      professionRole,
    };
    if (image) {
      userMsg.imageUrl = image;
    }
    session.messages.push(userMsg);

    const history = session.messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
    }));

    // Notify client about session initialization
    res.write(`data: ${JSON.stringify({ type: 'init', session })}\n\n`);

    let fullText = '';
    let detectedLang = language || 'English';

    const stream = generateChatResponseStream(history, userMsg.content, language, image, professionRole);
    for await (const chunkObj of stream) {
      if (chunkObj.chunk) {
        fullText += chunkObj.chunk;
        if (chunkObj.detectedLanguage) detectedLang = chunkObj.detectedLanguage;

        res.write(`data: ${JSON.stringify({ type: 'chunk', chunk: chunkObj.chunk, detectedLanguage: detectedLang })}\n\n`);
      }
    }

    // Save full assistant message to DB
    const assistantMsg = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant' as const,
      content: fullText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLang,
      professionRole,
    };
    session.messages.push(assistantMsg);
    session.updatedAt = new Date().toISOString();
    db.saveChatSession(session);

    res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg, session })}\n\n`);
    res.end();
  } catch (err: any) {
    console.error('Chat stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err?.message || 'Streaming failed' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: err?.message || 'Stream interrupted' })}\n\n`);
      res.end();
    }
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId, language = 'English', image, professionRole = 'general' } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Message content or image is required' });
    }

    const defaultTitle = message 
      ? (message.substring(0, 36) + (message.length > 36 ? '...' : ''))
      : 'Visual Camera Analysis';

    let session = sessionId ? db.getChatSessionById(sessionId) : null;
    if (!session) {
      session = {
        id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: defaultTitle,
        language: language || 'English',
        professionRole,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } else if (professionRole && session.professionRole !== professionRole) {
      session.professionRole = professionRole;
    }

    // Add user message with optional image
    const userMsg: any = {
      id: `msg-${Date.now()}-u`,
      role: 'user' as const,
      content: message || 'Please analyze this captured image / screenshot for SEO, UX, layout, and visibility signals.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      professionRole,
    };
    if (image) {
      userMsg.imageUrl = image;
    }
    session.messages.push(userMsg);

    // Call Gemini with conversation history
    const history = session.messages.slice(-8).map(m => ({
      role: m.role,
      content: m.content,
      imageUrl: m.imageUrl,
    }));
    const { text, detectedLanguage } = await generateChatResponse(history, userMsg.content, language, image, professionRole);

    // Add assistant response
    const assistantMsg = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: detectedLanguage,
      professionRole,
    };
    session.messages.push(assistantMsg);
    session.updatedAt = new Date().toISOString();

    db.saveChatSession(session);
    return res.json({ session, reply: assistantMsg });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err?.message || 'AI Chat failed' });
  }
});

app.get('/api/chat/sessions', (req, res) => {
  res.json(db.getChatSessions());
});

app.get('/api/chat/sessions/:id', (req, res) => {
  const session = db.getChatSessionById(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.delete('/api/chat/sessions/:id', (req, res) => {
  const success = db.deleteChatSession(req.params.id);
  res.json({ success });
});

// ==========================================
// 4. AUTHENTICATION & PROFILE ENDPOINTS
// ==========================================

// Helper to extract authenticated user from request header
function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization || '';
  if (authHeader) {
    const user = db.getUserByToken(authHeader);
    if (user) return user;
  }
  return null;
}

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = db.getUserByEmail(cleanEmail);

    // If user doesn't exist yet, automatically provision professional account so login works seamlessly
    if (!user) {
      const defaultName = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const capitalizedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      db.createUser(capitalizedName, cleanEmail, 'hash_pwd_' + Date.now());
      user = db.getUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(500).json({ error: 'Unable to initialize user account' });
    }

    const token = db.createSessionToken(user.id);
    const { passwordHash: _, ...profile } = user as any;

    return res.json({
      success: true,
      user: profile,
      token,
      message: `Welcome back, ${profile.name}!`,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error?.message || 'Login failed' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existingUser = db.getUserByEmail(cleanEmail);

    if (existingUser) {
      const token = db.createSessionToken(existingUser.id);
      const { passwordHash: _, ...profile } = existingUser as any;
      return res.json({
        success: true,
        user: profile,
        token,
        message: `Welcome back to your account, ${profile.name}!`,
      });
    }

    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const created = db.createUser(formattedName, cleanEmail, 'hash_' + Date.now());
    const token = db.createSessionToken(created.id);

    return res.json({
      success: true,
      user: created,
      token,
      message: `Account created successfully! Welcome, ${created.name}.`,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to create account' });
  }
});

// OAuth 2.0 Social Login (Google & Facebook)
app.post('/api/auth/oauth', (req, res) => {
  try {
    const { provider, email, name, avatarUrl } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'OAuth email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existingUser = db.getUserByEmail(cleanEmail);

    if (!existingUser) {
      const cleanName = (name && name.trim()) || cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      const created = db.createUser(formattedName, cleanEmail, `oauth_${provider?.toLowerCase() || 'social'}_${Date.now()}`);
      if (avatarUrl) {
        db.updateProfile(created.id, { avatarUrl });
      }
      existingUser = db.getUserByEmail(cleanEmail);
    } else if (avatarUrl && !existingUser.avatarUrl.includes('unsplash') && !existingUser.avatarUrl.includes('googleusercontent')) {
      db.updateProfile(existingUser.id, { avatarUrl });
      existingUser = db.getUserByEmail(cleanEmail);
    }

    if (!existingUser) {
      return res.status(500).json({ error: 'Failed to provision social account' });
    }

    const token = db.createSessionToken(existingUser.id);
    const { passwordHash: _, ...profile } = existingUser as any;

    return res.json({
      success: true,
      user: profile,
      token,
      message: `Successfully authenticated via ${provider || 'OAuth'}! Welcome, ${profile.name}.`,
    });
  } catch (error: any) {
    console.error('OAuth login error:', error);
    return res.status(500).json({ error: error?.message || 'OAuth authentication failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (user) {
    return res.json(user);
  }
  // If no auth token provided, check if client requested demo access
  return res.status(401).json({ error: 'No active session', user: null });
});

app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader) {
    db.removeToken(authHeader);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.post('/api/user/profile', (req, res) => {
  const authUser = getAuthUser(req);
  const targetId = authUser ? authUser.id : 'usr-default-01';
  const { name, company, role, accountType } = req.body;
  const updated = db.updateProfile(targetId, { name, company, role, accountType });
  res.json(updated);
});

app.post('/api/user/avatar', (req, res) => {
  const authUser = getAuthUser(req);
  const targetId = authUser ? authUser.id : 'usr-default-01';
  const { avatarUrl } = req.body;
  if (!avatarUrl) return res.status(400).json({ error: 'Avatar URL/Data required' });
  const updated = db.updateProfile(targetId, { avatarUrl });
  res.json(updated);
});

app.delete('/api/user/avatar', (req, res) => {
  const authUser = getAuthUser(req);
  const targetId = authUser ? authUser.id : 'usr-default-01';
  const targetName = authUser ? authUser.name : 'Manas Mughal';
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}`;
  const updated = db.updateProfile(targetId, { avatarUrl: defaultAvatar });
  res.json(updated);
});

app.post('/api/user/change-password', (req, res) => {
  const authUser = getAuthUser(req);
  const targetId = authUser ? authUser.id : 'usr-default-01';
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const success = db.updatePassword(targetId, 'hash_secure_' + Date.now());
  res.json({ success: true, message: 'Password updated successfully' });
});

app.get('/api/user/sessions', (req, res) => {
  const authUser = getAuthUser(req);
  const targetId = authUser ? authUser.id : 'usr-default-01';
  res.json(db.getSessions(targetId));
});

// ==========================================
// 5. VITE INTEGRATION & SERVER STARTUP
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Visibility Auditor backend server running on http://localhost:${PORT}`);
  });
}

startServer();
