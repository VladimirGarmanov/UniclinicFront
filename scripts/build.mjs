import { clinic } from '../src/config/site.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { gzipSync, brotliCompressSync, constants } from 'node:zlib';
import { build } from 'vite';
import sharp from 'sharp';
import { load } from 'cheerio';
import { routes, redirects, pageData, siteOrigin, normalizeUrl, privacyReport, removedReviewIds } from './content.mjs';
import { metadata, isoDate } from './metadata.mjs';
import { auditRevision } from '../src/config/editorial.js';

const out = path.resolve('build');
const report = { pages: 0, images: 0, excludedUploads: [], brokenLinks: [], staging: process.env.STAGING === 'true' };
await build({ logLevel: 'warn' });
await build({ logLevel: 'warn', build: { ssr: 'src/entry-server.js', outDir: '.ssr' } });
const assetManifest = JSON.parse(await fs.readFile(path.join(out, '.vite/manifest.json'), 'utf8'));
const appAsset = Object.keys(assetManifest).find(key => key === 'src/App.js' || /^_App-.*\.js$/.test(key));
function routeModule(route) {
  if (['/oms', '/vmp', '/paid-treatment'].includes(route.url)) return 'src/pages/Treatment.js';
  if (route.url === '/questions/admin') return 'src/pages/AdminPanel/AdminPanel.js';
  const section = route.url.split('?')[0].split('/')[1];
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
await fs.mkdir(path.join(out, 'social'), { recursive: true });
await fs.mkdir('.generated/social', { recursive: true });
const socialCache = new Map();
async function socialPreview(route, heading, imageUrl) {
  // Archives share a section card. Medical and editorial pages get their own card.
  const label = route.noindex ? (route.parent === '/reviews' ? 'Отзывы пациентов' : 'Вопросы и ответы') : heading;
  const source = route.noindex || !imageUrl || !imageUrl.startsWith('/') || /\.svg$/.test(imageUrl)
    ? path.resolve('src/assets/home/9at58kjh5xg4451pkfzq0qxvvow2gzen.jpg') : path.join(out, imageUrl.slice(1));
  const bytes = await fs.readFile(source);
  const hash = crypto.createHash('sha256').update(bytes).update(label).update('social-v1').digest('hex').slice(0, 20);
  const filename = `${hash}.jpg`;
  if (!socialCache.has(hash)) {
    const cached = path.join('.generated/social', filename);
    try { await fs.access(cached); } catch {
      const words = label.split(/\s+/); const lines = [''];
      for (const word of words) {
        if ((lines.at(-1) + ' ' + word).trim().length > 43) lines.push('');
        lines[lines.length - 1] = (lines.at(-1) + ' ' + word).trim();
      }
      const text = lines.slice(0, 3).map((line, index) => `<text x="52" y="${438 + index * 55}" fill="white" font-family="sans-serif" font-size="40">${xmlEscape(line)}</text>`).join('');
      await sharp(bytes).rotate().resize(1200, 630, { fit: 'cover' }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#183650" fill-opacity="0.38"/><rect y="330" width="1200" height="300" fill="#183650" fill-opacity="0.94"/><text x="52" y="385" fill="#b7d8ee" font-family="sans-serif" font-size="28">Клиника МГУ · Москва</text>${text}</svg>`) }]).jpeg({ quality: 85 }).toFile(cached);
    }
    await fs.copyFile(cached, path.join(out, 'social', filename));
    socialCache.set(hash, '/social/' + filename);
  }
  return socialCache.get(hash);
}
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
  let { title, description } = metadata(route, h1);
  const identity = route.item?.fields?.ID || route.item?.id || route.code || route.url;
  if (seenTitles.has(title)) title = `${h1 || route.name} — №${identity} | ${clinic.name}`;
  seenTitles.add(title);
  if (seenDescriptions.has(description)) description += ` Материал №${identity}.`;
  seenDescriptions.add(description);
  const canonical = siteOrigin + (route.url === '/' ? '/' : route.url);
  $('title').text(title);
  $('head').append($('<meta>').attr({ name: 'description', content: description }));
  $('head').append($('<link>').attr({ rel: 'canonical', href: canonical }));
  if (route.noindex || report.staging) $('head').append($('<meta>').attr({ name: 'robots', content: report.staging ? 'noindex, nofollow' : route.robots || 'noindex, follow' }));
  const heroImage = $('main img').first().attr('src');
  const socialImage = siteOrigin + await socialPreview(route, route.url === '/' ? 'Проктология и хирургия в Москве' : h1 || route.name, heroImage);
  for (const [property, content] of Object.entries({ 'og:title': title, 'og:description': description, 'og:url': canonical, 'og:type': route.type === 'Article' ? 'article' : 'website', 'og:locale': 'ru_RU', 'og:image': socialImage })) $('head').append($('<meta>').attr({ property, content }));
  $('head').append('<meta name="twitter:card" content="summary_large_image"/>');
  for (const [property, content] of Object.entries({ 'og:image:width': '1200', 'og:image:height': '630', 'og:image:type': 'image/jpeg', 'og:image:alt': h1 || route.name })) $('head').append($('<meta>').attr({ property, content }));
  $('head').append($('<meta>').attr({ name: 'twitter:image', content: socialImage }));
  const schema = [{ '@context': 'https://schema.org', '@type': 'MedicalClinic', '@id': siteOrigin + '/#clinic', name: clinic.name, legalName: clinic.legalName, url: siteOrigin + '/', telephone: clinic.phoneHref.slice(4), email: clinic.email, address: { '@type': 'PostalAddress', streetAddress: clinic.address, addressLocality: 'Москва', addressCountry: 'RU' }, openingHours: clinic.openingHours, image: socialImage, medicalSpecialty: ['https://schema.org/Surgical', 'https://schema.org/Oncologic'] }];
  if (route.url !== '/') {
    const crumbs = [{ '@type': 'ListItem', position: 1, name: 'Главная', item: siteOrigin + '/' }];
    if (route.parent) crumbs.push({ '@type': 'ListItem', position: 2, name: routes.find(x => x.url === route.parent)?.name, item: siteOrigin + route.parent });
    crumbs.push({ '@type': 'ListItem', position: crumbs.length + 1, name: h1 || route.name, item: canonical });
    schema.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs });
  }
  if (route.code && !route.noindex) {
    const entity = { '@context': 'https://schema.org', '@type': route.type || 'WebPage', name: h1 || route.name,
      ...(route.type === 'Article' ? { headline: h1 || route.name } : {}), url: canonical,
      ...(heroImage ? { image: new URL(heroImage, siteOrigin).href } : {}) };
    if ($('.contentByline').length) {
      const authors = (route.item.properties?.AUTHOR?.values || []).map(value => value.value?.element).filter(author => author?.CODE && !['donchenko-konstantin-aleksandrovich', 'kakotkin-viktor-viktorovich'].includes(author.CODE));
      if (authors.length) entity.author = authors.map(author => ({ '@type': 'Person', name: author.NAME, url: siteOrigin + '/doctors/' + author.CODE }));
      const published = isoDate(route.item.fields?.DATE_CREATE);
      const modified = isoDate(route.item.editorial?.updatedAt || route.item.fields?.TIMESTAMP_X);
      if (published) entity.datePublished = published;
      if (modified) entity.dateModified = modified;
    }
    if (route.type === 'Article') entity.publisher = { '@id': siteOrigin + '/#clinic' };
    if (route.type === 'Physician') entity.memberOf = { '@id': siteOrigin + '/#clinic' };
    if (route.item.editorial?.reviewer) {
      entity.reviewedBy = { '@type': 'Person', name: route.item.editorial.reviewer.name, url: siteOrigin + '/doctors/' + route.item.editorial.reviewer.code };
      entity.lastReviewed = route.item.editorial.reviewedAt;
    }
    if (route.item.editorial?.sources?.length) entity.citation = route.item.editorial.sources.map(source => source.url);
    if (route.type === 'Article' && !entity.datePublished) {
      const published = isoDate(route.item.active_from || route.item.date_create);
      if (published) entity.datePublished = published;
      const modified = isoDate(route.item.timestamp_x);
      if (modified) entity.dateModified = modified;
    }
    schema.push(entity);
  }

  const questions = $('.faqItem').toArray().map(element => ({ '@type': 'Question', name: $(element).find('summary').text(), acceptedAnswer: { '@type': 'Answer', text: $(element).find('.faqAnswer').text() } }));
  if (questions.length && !route.noindex) schema.push({ '@context': 'https://schema.org', '@type': 'FAQPage', '@id': canonical + '#faq', mainEntity: questions });
  const seenVideos = new Set();
  $('a[data-video-src]').each((_, element) => {
    const link = $(element); const embedUrl = link.attr('data-video-src');
    const id = embedUrl?.match(/\/embed\/([\w-]+)/)?.[1];
    if (!id || seenVideos.has(id)) return;
    seenVideos.add(id);
    const name = link.closest('section').find('h2,h3').first().text() || h1;
    schema.push({ '@context': 'https://schema.org', '@type': 'VideoObject', name, embedUrl, thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, description: name });
  });

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
  const filename = route.url === '/' ? 'index.html' : route.page > 1 ? `${route.url.split('?')[0].slice(1)}-page-${route.page}.html` : route.url.slice(1) + '.html';
  await fs.mkdir(path.dirname(path.join(out, filename)), { recursive: true });
  await fs.writeFile(path.join(out, filename), $.html());
  manifest[route.url] = { file: filename, status: route.status || (route.url === '/404' ? 404 : 200), noindex: Boolean(route.noindex || report.staging), robots: route.robots || 'noindex, follow', title };
  report.pages++;
}
await sharp('src/assets/home/9at58kjh5xg4451pkfzq0qxvvow2gzen.jpg')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect y="440" width="1200" height="190" fill="#183650" fill-opacity="0.9"/><text x="56" y="515" fill="white" font-family="sans-serif" font-size="52">Клиника МГУ</text><text x="56" y="578" fill="white" font-family="sans-serif" font-size="32">Проктология и онкохирургия в Москве</text></svg>') }])
  .png().toFile(path.join(out, 'social.png'));
// Removed technical reviews retain their URL but return an explicit static 410 document.
const gonePage = load(await fs.readFile(path.join(out, '404.html'), 'utf8'));
gonePage('title').text('Публикация удалена | Клиника МГУ');
gonePage('main h1').first().text('Публикация удалена');
gonePage('main p').first().text('Эта публикация удалена. Перейдите к отзывам или свяжитесь с клиникой.');
gonePage('script, link[rel="modulepreload"], link[rel="canonical"]').remove();
await fs.writeFile(path.join(out, '410.html'), gonePage.html());

function lastmod(route) {
  // Static templates changed in this release. Never use the wall clock at build time.
  if (!route.item) return auditRevision;
  return isoDate(route.item.editorial?.updatedAt || route.item.fields?.TIMESTAMP_X || route.item.timestamp_x || route.item.fields?.DATE_CREATE || route.item.date_create) || '';
}
await fs.writeFile(path.join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + routes.filter(route => !route.noindex && (!route.page || route.page === 1) && (!route.status || route.status === 200)).map(route => `<url><loc>${xmlEscape(siteOrigin + route.url)}</loc>${lastmod(route) ? `<lastmod>${lastmod(route)}</lastmod>` : ''}</url>`).join('') + '</urlset>');
// Public-only catalog lets the live CMS list old and new materials without a rebuild.
await fs.writeFile(path.join(out, 'editorial-catalog.json'), JSON.stringify(routes.filter(route => route.item && !route.noindex && /^\/(articles|clinicalcases|news)\//.test(route.url)).map(route => ({ kind: route.url.split('/')[1], url: route.url, title: route.name, summary: '', published_at: isoDate(route.item.fields?.DATE_CREATE) || '' }))));
await fs.writeFile(path.join(out, 'robots.txt'), report.staging ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow:\nSitemap: ${siteOrigin}/sitemap.xml\n`);
await fs.writeFile(path.join(out, 'routes.json'), JSON.stringify({ routes: manifest, redirects, siteOrigin, staging: report.staging }));
// nginx resolves only enumerated pages: an unknown slug never falls back to index.html.
const quoteNginx = value => '"' + value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('$', '\\$') + '"';
const canonicalEntries = Object.entries(redirects).flatMap(([old, current]) => [old, old + '/'].map(url => `  ${quoteNginx(url)} ${quoteNginx(current)};`));
// error_page changes $uri to /404.html. Recompute canonical after that internal
// redirect instead of redirecting back to the cached, missing request path.
const nginxMaps = `map $uri $clinic_canonical_path {\n  volatile;\n  default $uri;\n${canonicalEntries.join('\n')}\n  ~^(.+)/$ $1;\n}\nmap $uri $clinic_ssg_file {\n  default /__missing_page__.html;\n  /questions $clinic_archive_file;\n  /reviews $clinic_archive_file;\n${Object.entries(manifest).filter(([url, item]) => item.status === 200 && !url.includes('?') && !['/questions', '/reviews'].includes(url)).map(([url, item]) => `  ${quoteNginx(url)} ${quoteNginx('/' + item.file)};`).join('\n')}\n}\n`;
const archiveMaps = `map "$uri:$arg_page" $clinic_page_redirect {
  volatile;
  default "";
  "/questions:1" /questions;
  "/reviews:1" /reviews;
}
map $arg_page $clinic_page {
  default invalid;
  "" 1;
  ~^[1-9][0-9]*$ $arg_page;
}
map "$uri:$clinic_page" $clinic_archive_file {
  default /__missing_page__.html;
${routes.filter(route => route.page).map(route => `  "${route.url.split('?')[0]}:${route.page}" "/${manifest[route.url].file}";`).join('\n')}
}
map $uri $clinic_gone {
  volatile;
  default 0;
${routes.filter(route => route.status === 410).map(route => `  ${quoteNginx(route.url)} 1;`).join('\n')}
}
`;
await fs.writeFile(path.join(out, 'nginx-maps.conf'), nginxMaps + archiveMaps);
await fs.mkdir('.generated', { recursive: true });
await fs.writeFile('.generated/privacy-review.json', JSON.stringify({ withheld: privacyReport, removedReviewIds: [...removedReviewIds] }, null, 2));
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
