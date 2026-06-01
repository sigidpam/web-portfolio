import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  portfolio_db: D1Database;
  portfolio_assets: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Rute Utama 
    if (url.pathname === '/') {
      return new Response('Hello! Portfolio Backend is running successfully with D1 and R2.', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 2. Rute API Experience
    if (url.pathname === '/api/experience') {
      try {
        const db = drizzle(env.portfolio_db, { schema });
        const result = await db.select().from(schema.experience);

        return new Response(JSON.stringify({ status: 'success', data: result }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
          },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }
    }

    // 3. Rute API Assets
    if (url.pathname === '/api/assets') {
      try {
        const objects = await env.portfolio_assets.list();
        
        return new Response(JSON.stringify({ status: 'success', files: objects.objects }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ status: 'error', message: error.message }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
        });
      }
    }

    // 404 Fallback
    return new Response('404 Not Found', { status: 404 });
  },
};
