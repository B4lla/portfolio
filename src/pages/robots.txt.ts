import type { APIRoute } from 'astro';
export const prerender = true;
export const GET: APIRoute = () => {
  const raw = import.meta.env.PUBLIC_SITE_URL || '';
  let origin: string | null = null;
  try { const url = new URL(raw); if (url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash) origin = url.origin; } catch { /* preview */ }
  const content = origin ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n';
  return new Response(content, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
