import fs from 'node:fs/promises';
import path from 'node:path';
import { render } from '../.ssr/entry-server.js';
import { PUBLIC_PAGES, SITE_URL, pageFromPath, renderSeoHead, escapeHtml } from '../src/lib/seo.js';

const config = JSON.parse(await fs.readFile('src/data/siteContent.generated.json', 'utf8'));
const template = await fs.readFile('dist/index.html', 'utf8');
if (!template.includes('<!--seo-head-->') || !template.includes('<!--app-html-->')) throw new Error('Missing prerender template markers');
const pages = [...PUBLIC_PAGES, pageFromPath('/404'), pageFromPath('/admin-portal')];
for (const page of pages) {
  const isAdmin = page.id === 'admin';
  let html = template.replace('<!--seo-head-->', renderSeoHead(page, config)).replace('<!--app-html-->', isAdmin ? '' : render(page.path));
  if (!isAdmin) html = html.replace('<div id="root">', '<div id="root" data-prerendered="true">');
  const file = page.path === '/' ? 'index.html' : page.path.slice(1) + '.html';
  await fs.writeFile(path.join('dist', file), html);
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PUBLIC_PAGES.map(page => `  <url><loc>${escapeHtml(SITE_URL + page.path)}</loc></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile('dist/sitemap.xml', sitemap);
// Let crawlers see the noindex directive on admin and error pages.
await fs.writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Prerendered ${PUBLIC_PAGES.length} public pages, a 404 page and a noindex admin shell for ${SITE_URL}.`);
