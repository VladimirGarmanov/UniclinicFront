// Targeted release checks for the October SEO audit, against the actual generated HTML.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import sharp from 'sharp';
import { serviceLandings } from '../src/config/service-landings.js';
const { routes, redirects, siteOrigin } = JSON.parse(await fs.readFile('build/routes.json', 'utf8'));
const home = load(await fs.readFile('build/index.html', 'utf8'));
// The homepage's brand/contact row lives in its hero; navigation is shared.
const headerLinks = $ => $('header .hdrTop a, header .hdrMid a').toArray().map(element => $(element).attr('href'));
const sitemap = load(await fs.readFile('build/sitemap.xml', 'utf8'), { xmlMode: true });
const sitemapUrls = sitemap('loc').toArray().map(element => sitemap(element).text());
const report = { indexablePages: 0, sitemapUrls: sitemapUrls.length, faqPages: 0, videoPages: 0, socialImages: 0, physicianPages: 0, articlePages: 0, filenameAlts: 0, heroBytes: 0 };
const socialImages = new Set();
for (const [url, route] of Object.entries(routes)) {
  const $ = load(await fs.readFile('build/' + route.file, 'utf8'));
  if (route.noindex) {
    assert.ok(!sitemapUrls.includes(siteOrigin + url), `noindex URL in sitemap: ${url}`);
    continue;
  }
  report.indexablePages++;
  assert.deepEqual(headerLinks($), headerLinks(home), `Header differs: ${url}`);
  assert.equal($('.hdrBot').length, url === '/' ? 0 : 1, `Brand row differs: ${url}`);
  assert.ok($('a[href="https://webformula.pro"]').attr('rel')?.includes('nofollow'), url);
  assert.equal($('iframe[src*="youtube"]').length, 0, `Eager video: ${url}`);
  const schemas = JSON.parse($('script[type="application/ld+json"]').text());
  if (schemas.some(entity => entity['@type'] === 'Physician')) report.physicianPages++;
  if (schemas.some(entity => entity['@type'] === 'Article')) report.articlePages++;
  if (schemas.some(entity => entity['@type'] === 'VideoObject')) report.videoPages++;
  const faq = schemas.find(entity => entity['@type'] === 'FAQPage');
  if (faq) {
    report.faqPages++;
    assert.deepEqual(faq.mainEntity.map(entry => entry.acceptedAnswer.text), $('.faqAnswer').toArray().map(element => $(element).text()), `FAQ differs from visible answers: ${url}`);
  }
  for (const image of $('img').toArray()) assert.doesNotMatch($(image).attr('alt') || '', /\.(?:jpe?g|png|webp|svg)$/i, `Filename alt: ${url}`);
  const preview = $('meta[property="og:image"]').attr('content');
  assert.ok(preview?.startsWith(siteOrigin + '/social/') && preview.endsWith('.jpg'), `Social preview: ${url}`);
  socialImages.add(preview.slice(siteOrigin.length));
  assert.ok($('meta[name="description"]').attr('content').length <= 180, `Description too long: ${url}`);
  if (/^\/(services|diseases)\//.test(url)) {
    assert.equal($('form[data-form="appointment"]').length, 1, `Appointment missing: ${url}`);
    assert.equal($('option[value="callback"]').length, 1, `Callback missing: ${url}`);
    assert.doesNotMatch($('main').text(), /Показывать блок цен|Особые состояния#|HemorrhoidalArteryLigation|Инфракраснаяфотокоагуляция|геммороидэктом|содержание сетчатки|VIDEOS/);
  }
}
for (const source of socialImages) {
  const metadata = await sharp('build' + source).metadata();
  assert.equal(metadata.width, 1200); assert.equal(metadata.height, 630);
}
report.socialImages = socialImages.size;
for (const entry of sitemap('url').toArray()) {
  const url = sitemap(entry).find('loc').text().slice(siteOrigin.length);
  assert.ok(routes[url] && !routes[url].noindex && !redirects[url], `Invalid sitemap target: ${url}`);
  assert.doesNotMatch(url, /^\/(questions|reviews)\//);
  assert.match(sitemap(entry).find('lastmod').text(), /^\d{4}-\d{2}-\d{2}$/);
}
for (const landing of serviceLandings.filter(item => item.published)) assert.ok(routes['/services/' + landing.code]);
const service = load(await fs.readFile('build/services/lechenie-gemorroya.html', 'utf8'));
assert.ok(service('.servicePrices tbody tr').length > 0);
assert.doesNotMatch(service('main').text(), /химиотерапии и радиотерапии|любых стадий онкологических/);
const hero = home('.homeHeroImage');
assert.equal(hero.attr('fetchpriority'), 'high');
assert.equal(hero.attr('loading'), 'eager');
const largestHero = hero.attr('srcset').split(',').at(-1).trim().split(' ')[0];
report.heroBytes = (await fs.stat('build' + largestHero)).size;
assert.ok(report.heroBytes < 180_000, 'Hero exceeds budget');
assert.ok(home('title').text().length <= 65);
await fs.writeFile('.generated/seo-audit-check.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
