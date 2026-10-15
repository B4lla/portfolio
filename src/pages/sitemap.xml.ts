import type { APIRoute } from 'astro';
export const prerender = true;
export const GET: APIRoute = () => {
  const raw = import.meta.env.PUBLIC_SITE_URL || '';
  let origin: string | null = null;
  try { const url = new URL(raw); if (url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash) origin = url.origin; } catch { /* preview */ }
  const routes = ['/en/', '/es/', '/en/engineering/', '/es/engineering/'];
  const entries = origin ? routes.map(route => `  <url><loc>${origin}${route}</loc></url>`).join('\n') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
