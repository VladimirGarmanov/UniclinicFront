import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createReadStream } from 'node:fs';

const root = path.resolve('build');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'routes.json'), 'utf8'));
const port = Number(process.env.PORT || 4173);
const backend = new URL(process.env.API_PROXY || 'http://127.0.0.1:8000');
if (backend.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(backend.hostname)) throw new Error('Local preview API_PROXY must be a loopback HTTP URL');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.pdf': 'application/pdf', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'; frame-src https://www.youtube-nocookie.com https://www.youtube.com https://yandex.ru; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
const server = http.createServer(async (req, res) => {
  try {
    for (const [key, value] of Object.entries(securityHeaders)) res.setHeader(key, value);
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400).end(); return; }
    if (pathname.startsWith('/api/')) {
      const proxy = http.request(new URL(req.url, backend), { method: req.method, headers: { ...req.headers, host: backend.host } }, upstream => {
        res.writeHead(upstream.statusCode, { ...upstream.headers, ...securityHeaders }); upstream.pipe(res);
      });
      proxy.on('error', () => { if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end('{"detail":"Локальный backend недоступен"}'); });
      req.pipe(proxy); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    const normalized = pathname.replace(/\/+$/, '') || '/';
    const redirect = manifest.redirects[normalized] || (normalized !== pathname ? normalized : null);
    if (redirect) { res.writeHead(301, { Location: redirect + url.search }).end(); return; }
    const route = manifest.routes[pathname];
    let file = route?.file;
    let status = route?.status || 200;
    if (!file && /^\/(assets|media|upload)\//.test(pathname) && !pathname.split('/').some(part => part.startsWith('.')) && mime[path.extname(pathname)]) file = pathname.slice(1);
    if (!file && ['/sitemap.xml', '/robots.txt', '/favicon.svg', '/social.png'].includes(pathname)) file = pathname.slice(1);
    if (!file) { file = '404.html'; status = 404; }
    let filename = path.resolve(root, file);
    if (!filename.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
    try { await fs.access(filename); } catch { filename = path.join(root, '404.html'); status = 404; }
    const extension = path.extname(filename);
    const encoding = req.headers['accept-encoding'] || '';
    const accepted = encoding.split(',').map(value => value.trim()).filter(value => !/;\s*q=0(?:\.0*)?$/.test(value)).map(value => value.split(';')[0]);
    for (const [name, suffix] of [['br', '.br'], ['gzip', '.gz']]) {
      if (!accepted.includes(name)) continue;
      try { await fs.access(filename + suffix); filename += suffix; res.setHeader('Content-Encoding', name); break; } catch {}
    }
    res.setHeader('Content-Type', mime[extension] || 'application/octet-stream');
    res.setHeader('Vary', 'Accept-Encoding');
    res.setHeader('Cache-Control', status === 404 || pathname.startsWith('/questions/admin') ? 'no-store' : /^\/(assets|media)\//.test(pathname) ? 'public, max-age=31536000, immutable' : 'no-cache');
    if (status === 404 || route?.noindex || manifest.staging) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.statusCode = status;
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(filename).pipe(res);
  } catch { if (!res.headersSent) res.writeHead(500, { 'Cache-Control': 'no-store' }); res.end(); }
});
server.listen(port, '127.0.0.1', () => console.log(`Local site: http://127.0.0.1:${port}`));
