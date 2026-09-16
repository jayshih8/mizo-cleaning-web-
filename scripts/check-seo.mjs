import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { PUBLIC_PAGES, SITE_URL } from '../src/lib/seo.js';

const config = JSON.parse(await fs.readFile('src/data/siteContent.generated.json', 'utf8'));
const titles = new Set();
const descriptions = new Set();
const files = new Map();
for (const page of PUBLIC_PAGES) {
  const html = await fs.readFile(path.join('dist', page.id === 'home' ? 'index.html' : page.id + '.html'), 'utf8');
  files.set(page.path, html);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/)[1];
  assert(title && !titles.has(title), `Missing or duplicated title: ${page.path}`);
  assert(description && !descriptions.has(description), `Missing or duplicated description: ${page.path}`);
  titles.add(title); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `H1 count: ${page.path}`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert(html.includes(`rel="canonical" href="${SITE_URL + page.path}"`));
  assert(html.includes('data-prerendered="true"'));
  assert(!html.includes('data:image/'), `Embedded images in public HTML: ${page.path}`);
  assert(!html.includes('jayshih8.github.io'));
  assert(!html.includes('noindex'));
  const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
  assert.equal(schemas.length, 1, `JSON-LD script count: ${page.path}`);
  const graph = JSON.parse(schemas[0][1])['@graph'];
  const ids = graph.map(node => node['@id']);
  assert.equal(new Set(ids).size, ids.length, 'Duplicate entity IDs');
  const business = graph.find(node => node['@type'] === 'LocalBusiness');
  assert.equal(business.name, config.company.name);
  assert(html.includes(business.telephone));
  assert(!business.sameAs?.includes('https://www.facebook.com/'));
  assert.equal(graph.filter(node => node['@type'] === 'BreadcrumbList').length, page.id === 'home' ? 0 : 1);
  for (const image of [...html.matchAll(/<img\b[^>]*>/g)]) {
    assert(/\balt="[^"]+"/.test(image[0]), `Missing image alt: ${page.path}`);
  }
  const resources = [...html.matchAll(/(?:src|href)="((?:\/media\/|\/assets\/|\/images\/)[^"]+)"/g)];
  for (const [, resource] of resources) await fs.access(path.join('dist', resource.slice(1)));
  console.log(`PASS ${page.path}: unique metadata, canonical, structured data, content and image resources`);
}
for (const service of config.services.items) {
  assert(files.get('/services').includes(`id="${service.id}"`));
  assert(files.get('/services').includes(service.title));
  assert(files.get('/services').includes(service.description));
}
for (const page of ['admin-portal', '404']) {
  const html = await fs.readFile(`dist/${page}.html`, 'utf8');
  assert(html.includes('content="noindex, nofollow"'));
  assert(!html.includes('rel="canonical"'));
  assert(!html.includes('application/ld+json'));
}
const sitemap = await fs.readFile('dist/sitemap.xml', 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]), PUBLIC_PAGES.map(page => SITE_URL + page.path));
assert((await fs.readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
const rootHtml = files.get('/');
const entry = rootHtml.match(/<script[^>]*src="([^"]+)"/)[1];
const entryBytes = (await fs.stat(path.join('dist', entry))).size;
assert(entryBytes < 500_000, `Public JavaScript exceeds 500 KB: ${entryBytes}`);
const js = await fs.readFile(path.join('dist', entry), 'utf8');
assert(!js.includes('data:image/jpeg;base64,'));
assert(!js.includes('data:image/png;base64,'));
console.log(`PASS admin noindex, 404, sitemap, robots and public JS budget: ${(entryBytes / 1024).toFixed(1)} KB`);
