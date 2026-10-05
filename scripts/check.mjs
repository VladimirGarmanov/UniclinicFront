// A short build gate, not a browser test suite.
import fs from 'node:fs/promises';
import { load } from 'cheerio';
const { routes } = JSON.parse(await fs.readFile('build/routes.json', 'utf8'));
const report = JSON.parse(await fs.readFile('build/build-report.json', 'utf8'));
const failures = [];
for (const [url, route] of Object.entries(routes)) {
  if (route.noindex) continue;
  const $ = load(await fs.readFile('build/' + route.file, 'utf8'));
  if ($('html').attr('lang') !== 'ru' || !$('h1').length || !$('main').text().trim()) failures.push(url + ': missing content');
  if (!$('title').text() || /React App|create-react-app/.test($('title').text())) failures.push(url + ': title');
  if (!$('meta[name="description"]').attr('content') || !$('link[rel="canonical"]').attr('href')) failures.push(url + ': metadata');
  if ($('main').length !== 1) failures.push(url + ': main landmark');
  for (const element of $('script[type="application/ld+json"]').toArray()) JSON.parse($(element).text());
}
if (report.brokenLinks.length) failures.push('Broken internal URLs: ' + report.brokenLinks.map(x => x.url).join(', '));
const assets = await fs.readdir('build/assets');
let totalJS = 0;
for (const file of assets.filter(file => file.endsWith('.js'))) totalJS += (await fs.stat('build/assets/' + file)).size;
if (totalJS > 1_000_000) failures.push(`All client JS exceeds 1 MB: ${totalJS}`);
if (assets.some(file => file.endsWith('.map'))) failures.push('Public source map');
if (failures.length) throw new Error(failures.join('\n'));
console.log(`${Object.keys(routes).length} HTML pages; links/metadata passed; all route JS combined ${totalJS} bytes.`);
