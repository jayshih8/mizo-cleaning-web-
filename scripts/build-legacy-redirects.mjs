import fs from 'node:fs/promises';
import path from 'node:path';
import { PUBLIC_PAGES, SITE_URL, escapeHtml } from '../src/lib/seo.js';

// GitHub Pages cannot set HTTP redirects. Immediate meta refresh forwards legacy
// project URLs to the corresponding canonical page without publishing a duplicate site.
const pages = [...PUBLIC_PAGES, { path: '/admin', name: '管理後台' }, { path: '/admin-portal', name: '管理後台' }];
for (const page of pages) {
  const canonical = SITE_URL + (page.path === '/admin' ? '/admin-portal' : page.path);
  const directory = path.join('legacy-pages', page.path.slice(1));
  await fs.mkdir(directory, { recursive: true });
  const html = `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(page.name)}｜美裝清潔維護</title><link rel="canonical" href="${canonical}"><meta http-equiv="refresh" content="0;url=${canonical}"></head><body><p>網站已搬遷至正式網址，請前往<a href="${canonical}">${escapeHtml(page.name)}</a>。</p></body></html>`;
  await fs.writeFile(path.join(directory, 'index.html'), html);
  if (page.path !== '/') await fs.writeFile(path.join('legacy-pages', page.path.slice(1) + '.html'), html);
}
await fs.writeFile('legacy-pages/404.html', `<!doctype html><html lang="zh-Hant-TW"><head><meta charset="UTF-8"><title>找不到頁面｜美裝清潔維護</title><meta name="robots" content="noindex"></head><body><h1>找不到頁面</h1><p><a href="${SITE_URL}/">前往美裝清潔維護正式網站</a></p></body></html>`);
await fs.writeFile('legacy-pages/.nojekyll', '');
console.log('Prepared canonical redirects for the legacy GitHub Pages website.');
