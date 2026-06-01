// backend/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { sign, verify } from 'hono/jwt';
import { experience, pdfDownloads, inquiries, visitors } from './schema';
import freeEmailDomains from 'free-email-domains';
import { desc } from 'drizzle-orm';

export type Env = {
  DB: D1Database;
  BUCKET: R2Bucket;
  TURNSTILE_SECRET: string;
  JWT_SECRET: string;
  ADMIN_PASSPHRASE: string;
};

const blockedDomains = new Set(freeEmailDomains);
const app = new Hono<{ Bindings: Env }>();

app.use('/api/*', cors({
  origin: ['http://localhost:4321', 'https://psigid.nothingbut.top'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// ==========================================
// 1. PUBLIC ROUTES (Analytics & Display)
// ==========================================

// Track visitors (called silently by the frontend on load)
app.post('/api/track', async (c) => {
  try {
    const { path } = await c.req.json();
    const userAgent = c.req.header('User-Agent') || 'Unknown';
    const db = drizzle(c.env.DB);
    await db.insert(visitors).values({ path, userAgent, visitedAt: new Date() });
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false }, 500); // Fail silently for user
  }
});

// Fetch Experience for public homepage
app.get('/api/experience', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(experience);
  return c.json({ success: true, data: result });
});

// ==========================================
// 2. AUTHENTICATION (Turnstile Captcha + JWT)
// ==========================================

app.post('/api/admin/login', async (c) => {
  const { passphrase, turnstileToken } = await c.req.json();

  // 1. Verify Turnstile Captcha with Cloudflare
  const formData = new FormData();
  formData.append('secret', c.env.TURNSTILE_SECRET);
  formData.append('response', turnstileToken);

  const turnstileCheck = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const turnstileOutcome = await turnstileCheck.json() as any;

  if (!turnstileOutcome.success) {
    return c.json({ success: false, message: 'Captcha verification failed. Are you a bot?' }, 403);
  }

  // 2. Verify Admin Passphrase
  if (passphrase !== c.env.ADMIN_PASSPHRASE) {
    return c.json({ success: false, message: 'Invalid credentials.' }, 401);
  }

  // 3. Issue JWT Token (Valid for 12 hours)
  const token = await sign(
    { role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12 },
    c.env.JWT_SECRET
  );

  return c.json({ success: true, token });
});

// ==========================================
// 3. SECURE ADMIN ROUTES (Protected by Middleware)
// ==========================================

// Middleware to verify JWT on all routes starting with /api/admin/data/
app.use('/api/admin/data/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.split(' ')[1];
  try {
    await verify(token, c.env.JWT_SECRET);
    await next(); // Token is valid, proceed to route
  } catch (e) {
    return c.json({ success: false, message: 'Invalid or expired token' }, 401);
  }
});

// Get Dashboard Aggregates (Visitors, Downloads, Inquiries)
app.get('/api/admin/data/dashboard', async (c) => {
  const db = drizzle(c.env.DB);
  
  const leads = await db.select().from(pdfDownloads).orderBy(desc(pdfDownloads.downloadedAt));
  const messages = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  const stats = await db.select().from(visitors).orderBy(desc(visitors.visitedAt)).limit(50);

  return c.json({ 
    success: true, 
    data: { leads, messages, stats } 
  });
});

export default app;
