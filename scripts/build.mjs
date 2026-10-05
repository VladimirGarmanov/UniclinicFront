import { clinic } from '../src/config/site.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { build } from 'vite';
import sharp from 'sharp';
import { load } from 'cheerio';
import { routes, redirects, pageData, siteOrigin, normalizeUrl } from './content.mjs';

const out = path.resolve('build');
const report = { pages: 0, images: 0, excludedUploads: [], brokenLinks: [], staging: process.env.STAGING === 'true' };
await build({ logLevel: 'warn' });
await build({ logLevel: 'warn', build: { ssr: 'src/entry-server.js', outDir: '.ssr' } });
const assetManifest = JSON.parse(await fs.readFile(path.join(out, '.vite/manifest.json'), 'utf8'));
const appAsset = Object.keys(assetManifest).find(key => key === 'src/App.js' || /^_App-.*\.js$/.test(key));
function routeModule(route) {
  if (route.url.startsWith('/services/prices/')) return 'src/pages/Treatment.js';
  if (route.url === '/questions/admin') return 'src/pages/AdminPanel/AdminPanel.js';
  const section = route.url.split('/')[1];
  const name = { '': 'Home', team: 'Team', doctors: 'Team', clinicalcases: 'Clinicalcases', 'fecal-incontinence-scale': 'Fecal-incontinence-scale', 'need-proctologist-consultation': 'Need-proctologist-consultation', '404': 'NotFound' }[section] || section.charAt(0).toUpperCase() + section.slice(1);
  return ['Search', 'Sitemap'].includes(name) ? `src/pages/${name}.js` : `src/pages/${name}/${name}.js`;
}
function dependencies(key, result = new Set()) {
  if (!key || result.has(key) || !assetManifest[key]) return result;
  result.add(key);
  for (const imported of assetManifest[key].imports || []) dependencies(imported, result);
  return result;
}
const template = await fs.readFile(path.join(out, 'index.html'), 'utf8');
const { render } = await import(path.resolve('.ssr/entry-server.js') + '?build=' + Date.now());
async function walk(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file)); else if (entry.isFile()) result.push(file);
  }
  return result;
}
// Public is an old CMS export. Never copy executable/hidden files, archives or CSV exports.
for (const file of await walk('public/upload')) {
  const relative = file.replace(/^public\//, '');
  if (file.split(path.sep).some(part => part.startsWith('.') || part === 'tmp') || !/\.(png|jpe?g|gif|webp|avif|pdf|woff2?|ttf)$/i.test(file)) {
    report.excludedUploads.push(relative); continue;
  }
  const destination = path.join(out, relative);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(file, destination);
}
await fs.writeFile(path.join(out, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#244b6a"/><path d="M26 12h12v14h14v12H38v14H26V38H12V26h14z" fill="white"/></svg>');
await fs.mkdir('.generated/media', { recursive: true });
const imageMap = {};
const optimized = new Map();
await fs.mkdir(path.join(out, 'media'), { recursive: true });
const imageFiles = (await walk(out)).filter(file => /\.(png|jpe?g|webp|avif)$/i.test(file));
let nextImage = 0;
async function imageWorker() {
  while (nextImage < imageFiles.length) {
    const file = imageFiles[nextImage++];
    const originalUrl = '/' + path.relative(out, file).split(path.sep).join('/');
    const bytes = await fs.readFile(file);
    const hash = crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 20);
    if (!optimized.has(hash)) optimized.set(hash, (async () => {
      try {
        const metadata = await sharp(bytes).metadata();
        if (!metadata.width || !metadata.height || metadata.pages > 1) return null;
        const oriented = metadata.autoOrient || metadata;
        const width = oriented.width, height = oriented.height;
        if (width < 120 || height < 80) return { src: originalUrl, width, height };
        const widths = [...new Set([400, 800, 1280].map(size => Math.min(size, width)))];
        const variants = [];
        for (const size of widths) {
          const name = `${hash}-${size}.webp`;
          const cached = path.resolve('.generated/media', name);
          try { await fs.access(cached); } catch { await sharp(bytes).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 82 }).toFile(cached); }
          await fs.copyFile(cached, path.join(out, 'media', name));
          variants.push({ url: '/media/' + name, width: size });
        }
        report.images++;
        return { src: variants.find(item => item.width >= 800)?.url || variants.at(-1).url, srcset: variants.map(item => `${item.url} ${item.width}w`).join(', '), width, height };
      } catch { return null; }
    })());
    const image = await optimized.get(hash);
    if (image) imageMap[originalUrl] = image;
  }
}
await Promise.all(Array.from({ length: 4 }, imageWorker));
globalThis.__IMAGE_DATA__ = imageMap;
const known = new Set(routes.map(route => route.url));
const broken = new Map();
const xmlEscape = value => String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
const jsonScript = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const manifest = {};
const seenTitles = new Set();
const seenDescriptions = new Set();
for (const route of routes) {
  globalThis.__USED_IMAGES__ = {};
  const $ = load(template);
  $('#root').html(render(route.url));
  const assets = new Set([...dependencies(appAsset), ...dependencies(routeModule(route))]);
  for (const key of assets) {
    const asset = assetManifest[key];
    for (const css of asset.css || []) if (!$(`link[href="/${css}"]`).length) $('head').append($('<link>').attr({ rel: 'stylesheet', href: '/' + css }));
    if (asset.file.endsWith('.js')) $('head').append($('<link>').attr({ rel: 'modulepreload', href: '/' + asset.file }));
  }
  const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
  let title = `${h1 || route.name} | Университетская клиника МГУ`;
  const identity = route.item?.fields?.ID || route.item?.id || route.code || route.url;
  if (seenTitles.has(title)) title = `${h1 || route.name} — материал №${identity} | Университетская клиника МГУ`;
  seenTitles.add(title);
  const mainText = $('main p, main .qaQuestionText, main .reviewsDetailText').first().text().replace(/\s+/g, ' ').trim();
  let description = `${h1 || route.name}. ${mainText || 'Отделение хирургии МНОЦ МГУ имени М. В. Ломоносова.'}`.slice(0, 240);
  if (seenDescriptions.has(description)) description += ` Материал №${identity}.`;
  seenDescriptions.add(description);
  const canonical = siteOrigin + (route.url === '/' ? '/' : route.url);
  $('title').text(title);
  $('head').append($('<meta>').attr({ name: 'description', content: description }));
  $('head').append($('<link>').attr({ rel: 'canonical', href: canonical }));
  if (route.noindex || report.staging) $('head').append('<meta name="robots" content="noindex, nofollow"/>');
  const heroImage = $('main img').first().attr('src');
  const socialImage = heroImage ? new URL(heroImage, siteOrigin).href : siteOrigin + '/social.png';
  for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': description, 'og:url': canonical, 'og:type': route.type === 'Article' ? 'article' : 'website', 'og:locale': 'ru_RU', 'og:image': socialImage })) $('head').append($('<meta>').attr({ property, content }));
  $('head').append('<meta name="twitter:card" content="summary_large_image"/>');
  const schema = [{ '@context': 'https://schema.org', '@type': 'MedicalClinic', '@id': siteOrigin + '/#clinic', name: clinic.name, url: siteOrigin + '/', telephone: clinic.phoneHref.slice(4), email: clinic.email }];
  if (route.url !== '/') {
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Главная', item: siteOrigin + '/' }];
    if (route.parent) crumbs.push({ '@type': 'ListItem', position: 2, name: routes.find(x => x.url === route.parent)?.name, item: siteOrigin + route.parent });
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: h1 || route.name, item: canonical });
    schema.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs });
  }
  if (route.code) schema.push({ '@context': 'https://schema.org', '@type': route.type || 'WebPage', name: h1 || route.name, ...(route.type === 'Article' ? { headline: h1 || route.name } : {}), url: canonical, ...(heroImage ? { image: socialImage } : {}) });
  $('head').append(`<script type="application/ld+json">${jsonScript(schema)}</script>`);
  $('a[href]').each((_, element) => {
    const anchor = $(element), href = normalizeUrl(anchor.attr('href'));
    anchor.attr('href', href);
    if (href.startsWith('/') && !href.startsWith('//')) {
      const target = decodeURI(href.split(/[?#]/)[0]);
      if (!known.has(target) && !target.startsWith('/upload/') && !target.startsWith('/media/')) broken.set(target, (broken.get(target) || 0) + 1);
    }
  });
  $('iframe').each((_, element) => { const frame = $(element); frame.attr({ loading: 'lazy', title: frame.attr('title') || 'Видео или карта', referrerpolicy: 'strict-origin-when-cross-origin' }); });
  $('body').append(`<script type="application/json" id="page-data">${jsonScript(pageData(route))}</script><script type="application/json" id="image-data">${jsonScript(globalThis.__USED_IMAGES__)}</script>`);
  const filename = route.url === '/' ? 'index.html' : route.url.slice(1) + '.html';
  await fs.mkdir(path.dirname(path.join(out, filename)), { recursive: true });
  await fs.writeFile(path.join(out, filename), $.html());
  manifest[route.url] = { file: filename, status: route.url === '/404' ? 404 : 200, noindex: Boolean(route.noindex || report.staging), title };
  report.pages++;
}
await sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#244b6a"/><text x="80" y="270" fill="white" font-family="sans-serif" font-size="62">Университетская клиника МГУ</text><text x="80" y="370" fill="white" font-family="sans-serif" font-size="48">Отделение хирургии</text></svg>')).png().toFile(path.join(out, 'social.png'));
function lastmod(route) {
  const value = route.item?.fields?.TIMESTAMP_X || route.item?.timestamp_x || '';
  const match = String(value).match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}
await fs.writeFile(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.filter(route => !route.noindex).map(route => `<url><loc>${xmlEscape(siteOrigin + route.url)}</loc>${lastmod(route) ? `<lastmod>${lastmod(route)}</lastmod>` : ''}</url>`).join('') + '</urlset>');
await fs.writeFile(path.join(out, 'robots.txt'), report.staging ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow: /api/\nDisallow: /questions/admin\nDisallow: /search\nSitemap: ${siteOrigin}/sitemap.xml\n`);
await fs.writeFile(path.join(out, 'routes.json'), JSON.stringify({ routes: manifest, redirects, siteOrigin, staging: report.staging }));
// nginx resolves only enumerated pages: an unknown slug never falls back to index.html.
const quoteNginx = value => '"' + value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('$', '\\$') + '"';
const canonicalEntries = Object.entries(redirects).flatMap(([old, current]) => [old, old + '/'].map(url => `  ${quoteNginx(url)} ${quoteNginx(current)};`));
// error_page changes $uri to /404.html. Recompute canonical after that internal
// redirect instead of redirecting back to the cached, missing request path.
const nginxMaps = `map $uri $clinic_canonical_path {\n  volatile;\n  default $uri;\n${canonicalEntries.join('\n')}\n  ~^(.+)/$ $1;\n}\nmap $uri $clinic_ssg_file {\n  default /__missing_page__.html;\n${Object.entries(manifest).filter(([, item]) => item.status === 200).map(([url, item]) => `  ${quoteNginx(url)} ${quoteNginx('/' + item.file)};`).join('\n')}\n}\n`;
await fs.writeFile(path.join(out, 'nginx-maps.conf'), nginxMaps);
report.brokenLinks = [...broken].map(([url, count]) => ({ url, count }));
await fs.writeFile(path.join(out, 'build-report.json'), JSON.stringify(report, null, 2));
for (const file of await walk(out)) {
  if (!/\.(html|js|css|json|xml|svg|txt)$/.test(file)) continue;
  const bytes = await fs.readFile(file);
  if (bytes.length < 1024) continue;
  await fs.writeFile(file + '.gz', gzipSync(bytes, { level: 9 }));
  await fs.writeFile(file + '.br', brotliCompressSync(bytes, { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } }));
}
console.log(JSON.stringify({ pages: report.pages, optimizedImages: report.images, excludedUploads: report.excludedUploads.length, brokenLinks: report.brokenLinks.length }, null, 2));
