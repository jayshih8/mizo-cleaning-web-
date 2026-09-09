import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const output = path.join(root, 'public', 'media');
await fs.mkdir(output, { recursive: true });
const original = JSON.parse(await fs.readFile('src/data/contentConfig.json', 'utf8'));
const cache = new Map();
const imageInfo = {};
let totalOriginal = 0;
let totalOptimized = 0;

async function optimize(source, logo = false) {
  const key = `${logo}:${source}`;
  if (cache.has(key)) return cache.get(key);
  let buffer;
  if (/^data:image\/(png|jpeg|jpg|webp);base64,/.test(source)) {
    buffer = Buffer.from(source.slice(source.indexOf(',') + 1), 'base64');
  } else if (/^\/?images\/[\w.-]+\.(png|jpe?g|webp)$/i.test(source)) {
    buffer = await fs.readFile(path.join(root, 'public', source.replace(/^\//, '')));
  } else return source;
  const hash = createHash('sha256').update(buffer).update(logo ? 'logo-128-v1' : 'photo-v1').digest('hex').slice(0, 20);
  const optimized = await sharp(buffer).rotate().resize({ width: logo ? 128 : 1600, height: logo ? 128 : 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
  const filename = `${hash}.webp`;
  await fs.writeFile(path.join(output, filename), optimized);
  totalOriginal += buffer.length;
  totalOptimized += optimized.length;
  const url = '/media/' + filename;
  const metadata = await sharp(optimized).metadata();
  const variants = [{ url, width: metadata.width }];
  if (!logo) for (const width of [480, 960]) {
    if (width >= metadata.width) continue;
    const resized = await sharp(optimized).resize({ width }).webp({ quality: 80 }).toBuffer();
    const variantName = `${hash}-${width}.webp`;
    await fs.writeFile(path.join(output, variantName), resized);
    variants.push({ url: '/media/' + variantName, width });
  }
  imageInfo[url] = { width: metadata.width, height: metadata.height, srcSet: variants.sort((a, b) => a.width - b.width).map(item => `${item.url} ${item.width}w`).join(', ') };
  cache.set(key, url);
  return url;
}

async function walk(value, key = '') {
  if (typeof value === 'string') return optimize(value, ['logoImage', 'favicon'].includes(key));
  if (Array.isArray(value)) return Promise.all(value.map(item => walk(item, key)));
  if (value && typeof value === 'object') {
    const result = {};
    for (const [name, child] of Object.entries(value)) result[name] = await walk(child, name);
    return result;
  }
  return value;
}

// Fill image fallbacks in the generated public copy; keep the editable CMS source intact.
const serviceImages = { 'building-factory': 'images/banner_building.png', 'hotel-cleaning': 'images/hotel.jpg', 'office-cleaning': 'images/history.jpg', 'hospital-cleaning': 'images/training.jpg' };
for (const item of original.services.items) item.image ||= serviceImages[item.id] || 'images/banner_building.png';
const content = await walk(original);
const heroPath = /^\/media\/[\w.-]+$/.test(content.home.heroBanner)
  ? content.home.heroBanner.slice(1)
  : 'images/banner_building.png';
const hero = await fs.readFile(path.join(root, 'public', heroPath));
const social = await sharp(hero).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer();
const socialName = createHash('sha256').update(social).digest('hex').slice(0, 20) + '.jpg';
await fs.writeFile(path.join(output, socialName), social);
const faviconSource = content.company.favicon || content.company.logoImage;
let favicon = faviconSource && !faviconSource.startsWith('data:') ? faviconSource : '/favicon.svg';
if (faviconSource?.startsWith('/media/')) {
  const icon = await sharp(path.join(root, 'public', faviconSource.slice(1))).resize(96, 96, { fit: 'contain', background: '#ffffff' }).png().toBuffer();
  const iconName = createHash('sha256').update(icon).digest('hex').slice(0, 20) + '.png';
  await fs.writeFile(path.join(output, iconName), icon);
  favicon = '/media/' + iconName;
}
content.seoAssets = { socialImage: '/media/' + socialName, favicon, images: imageInfo };
await fs.writeFile('src/data/siteContent.generated.json', JSON.stringify(content));
console.log(`Prepared ${cache.size} image references: ${(totalOriginal / 1024).toFixed(0)} KB → ${(totalOptimized / 1024).toFixed(0)} KB. CMS source preserved.`);
