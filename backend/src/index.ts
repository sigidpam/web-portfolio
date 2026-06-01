import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { sign, verify } from 'hono/jwt';
import { pdfDownloads, inquiries } from './schema';
import { desc } from 'drizzle-orm';

// Environment Bindings
type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  TURNSTILE_SECRET: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS Setup
app.use('/api/*', cors({
  origin: ['https://psigid.nothingbut.top'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Content-Type'],
}));

// --- AUTHENTICATION ENDPOINTS ---

app.post('/api/admin/login', async (c) => {
  const { passphrase, turnstileToken } = await c.req.json();

  // 1. Prepare Turnstile Verification
  const params = new URLSearchParams();
  params.append('secret', c.env.TURNSTILE_SECRET);
  params.append('response', turnstileToken);
  params.append('remoteip', c.req.header('CF-Connecting-IP') || '');

  // 2. Perform Verification
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const outcome = await verifyRes.json() as any;

  if (!outcome.success) {
    console.error("Turnstile Debug:", outcome); // Check your Worker logs!
    return c.json({ 
      success: false, 
      message: 'Captcha failed', 
      debug: outcome['error-codes'] 
    }, 403);
  }

  // 3. Password Check
  if (passphrase !== "your_actual_password_here") {
    return c.json({ success: false, message: 'Invalid credentials' }, 401);
  }

  // 4. Issue Token
  const jwt = await sign({ role: 'admin' }, c.env.JWT_SECRET);
  return c.json({ success: true, token: jwt });
});

// --- SECURE MIDDLEWARE ---

app.use('/api/admin/data/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return await next();
  
  const authHeader = c.req.header('Authorization');
  if (!authHeader) return c.json({ success: false, message: 'Missing token' }, 401);

  try {
    const jwt = authHeader.replace('Bearer ', '');
    await verify(jwt, c.env.JWT_SECRET);
    await next();
  } catch (e) {
    return c.json({ success: false, message: 'Invalid token' }, 401);
  }
});

// --- DATA ROUTES ---

app.get('/api/admin/data/dashboard', async (c) => {
  const db = drizzle(c.env.DB);
  const leads = await db.select().from(pdfDownloads).orderBy(desc(pdfDownloads.downloadedAt));
  const messages = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  
  return c.json({ 
    success: true, 
    data: { leads, messages } 
  });
});

export default app;