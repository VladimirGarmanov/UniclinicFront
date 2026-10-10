// One small integration smoke check against the loopback preview only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin = 'http://127.0.0.1:4173';
const { routes } = JSON.parse(await fs.readFile('build/routes.json', 'utf8'));
const targets = Object.keys(routes).filter(url => url.startsWith('/news/') || ['/oms', '/vmp', '/paid-treatment', '/services/lechenie-gemorroya', '/diseases/gemorroy', '/services/konsultatsiya-proktologa', '/services/ligirovanie-gemorroidalnykh-uzlov', '/services/lazernoe-lechenie-gemorroya', '/services/truzi', '/services/vtoroe-mnenie-onkologa'].includes(url));
for (const url of targets) {
  const response = await fetch(origin + url, { redirect: 'manual' });
  assert.equal(response.status, 200, url);
  assert.match(await response.text(), /<h1/);
}
for (const url of ['/not-a-real-page-91736', '/news/not-a-real-slug', '/404', '/assets/main.js.map', '/upload/tmp/test.php', '/routes.json']) {
  assert.equal((await fetch(origin + url, { redirect: 'manual' })).status, 404, url);
}
for (const [url, target] of [['/doctors/', '/team'], ['/home', '/'], ['/news/', '/news'], ['/services/prices/besplatnoe-lechenie-po-polisu-oms', '/oms'], ['/diseases/pakhovaya-gryzha-foto-simptomy-lechenie', '/diseases/pakhovaya-gryzha']]) {
  const response = await fetch(origin + url, { redirect: 'manual' });
  assert.equal(response.status, 301, url); assert.equal(response.headers.get('location'), target);
}
assert.equal((await fetch(origin + '/', { method: 'DELETE' })).status, 405);
const sitemap = await fetch(origin + '/sitemap.xml'); assert.match(sitemap.headers.get('content-type'), /application\/xml/);
const html = await fetch(origin + '/', { headers: { 'Accept-Encoding': 'gzip' } });
assert.equal(html.headers.get('content-encoding'), 'gzip');
assert.ok(html.headers.has('content-security-policy'));
const socialPath = (await (await fetch(origin + '/')).text()).match(/property="og:image" content="https:\/\/uniclinic.pro([^"]+)/)[1];
const social = await fetch(origin + socialPath); assert.equal(social.status, 200); assert.match(social.headers.get('content-type'), /image\/jpeg/);
const health = await fetch(origin + '/api/health'); assert.equal(health.status, 200);
assert.equal((await fetch(origin + '/api/admin/questions')).status, 401);
console.log(`Passed ${targets.length} news/treatment URLs, real 404/301/405, sitemap XML, gzip/security headers and local API proxy.`);
