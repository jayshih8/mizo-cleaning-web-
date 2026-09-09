import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { absoluteUrl, getStructuredData, getPageSeo, pageFromPath, renderSeoHead, serializeJsonLd, SITE_URL } from '../src/lib/seo.js';

const config = JSON.parse(fs.readFileSync('src/data/contentConfig.json', 'utf8'));

test('route resolution preserves deep links and does not turn unknown URLs into home', () => {
  assert.equal(pageFromPath('/services/').id, 'services');
  assert.equal(pageFromPath('/process?utm_source=test').id, 'process');
  assert.equal(pageFromPath('/admin').id, 'admin');
  assert.equal(pageFromPath('/services/nonexistent').id, 'not-found');
  assert.equal(pageFromPath('/home').path, '/');
});
test('canonical URL ignores tracking parameters and uses the formal domain', () => {
  assert.equal(getPageSeo(pageFromPath('/services?utm_source=test'), config).canonical, SITE_URL + '/services');
  assert.equal(absoluteUrl('images/hotel.jpg'), SITE_URL + '/images/hotel.jpg');
  assert.equal(absoluteUrl('javascript:alert(1)'), undefined);
  assert.equal(absoluteUrl('data:image/png;base64,test'), undefined);
});
test('private and unknown pages have noindex, no canonical and no public entity markup', () => {
  for (const pathname of ['/admin', '/admin-portal', '/does-not-exist']) {
    const page = pageFromPath(pathname);
    assert.equal(getPageSeo(page, config).noindex, true);
    assert.equal(getPageSeo(page, config).canonical, null);
    assert.equal(getStructuredData(page, config), null);
  }
});
test('business details follow CMS data and omit unsupported claims', () => {
  const c = structuredClone(config);
  c.company.phoneFormatted = '0912345678';
  c.company.workHours = '請來電洽詢';
  c.company.address = '新北市板橋區文化路一段1號';
  const business = getStructuredData(pageFromPath('/'), c)['@graph'][0];
  assert.equal(business.telephone, '0912345678');
  assert.equal(business.address.addressRegion, '新北市');
  assert.equal(business.address.addressLocality, '板橋區');
  assert.equal(business.openingHoursSpecification, undefined);
  assert.equal(business.aggregateRating, undefined);
  assert.equal(business.priceRange, undefined);
  assert(!business.sameAs.includes('https://www.facebook.com/'));
});
test('all declared services have matching fragment URLs and a shared provider', () => {
  const graph = getStructuredData(pageFromPath('/services'), config)['@graph'];
  const services = graph.filter(node => node['@type'] === 'Service');
  assert.equal(services.length, config.services.items.length);
  services.forEach((service, index) => {
    assert.equal(service.url, SITE_URL + '/services#' + config.services.items[index].id);
    assert.equal(service.provider['@id'], SITE_URL + '/#business');
  });
});
test('structured data cannot break out of its script and verification is in initial HTML', () => {
  const c = structuredClone(config);
  c.company.name = '</script><script>alert(1)</script>';
  c.company.googleVerification = 'test-verification-token';
  const serialized = serializeJsonLd(getStructuredData(pageFromPath('/'), c));
  assert(!serialized.includes('</script>'));
  assert.equal(JSON.parse(serialized)['@graph'][0].name, c.company.name);
  const head = renderSeoHead(pageFromPath('/'), c);
  assert(head.includes('name="google-site-verification" content="test-verification-token"'));
});
