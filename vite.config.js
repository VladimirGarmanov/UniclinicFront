import fs from 'node:fs/promises';
import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { datasets, catalog } from './scripts/content.mjs';

export default defineConfig(({ isSsrBuild }) => ({
  publicDir: false,
  plugins: [
    {
      name: 'page-content', enforce: 'pre',
      resolveId(source) {
        if (source.includes('/assets/info/') || source.endsWith('/generated/catalog.json')) return '\0page-content:' + path.basename(source) + '.js';
      },
      load(id) {
        if (!id.startsWith('\0page-content:')) return;
        const name = id.slice('\0page-content:'.length, -3);
        const data = name === 'catalog.json' ? catalog : datasets[name];
        if (!data) return;
        return isSsrBuild
          ? `export default ${JSON.stringify(data)};`
          : `export default globalThis.__PAGE_DATA__?.[${JSON.stringify(name)}] || {};`;
      },
      configureServer(server) {
        server.middlewares.use('/upload', async (req, res) => {
          const root = path.resolve('public/upload');
          try {
            const relative = decodeURIComponent(req.url.split('?')[0]);
            const extension = path.extname(relative).toLowerCase();
            const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf' };
            if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
            if (!types[extension] || relative.split('/').some(part => part.startsWith('.') || part === 'tmp')) throw new Error('Not a public asset');
            const file = await fs.realpath(path.resolve(root, '.' + relative));
            if (!file.startsWith(root + path.sep)) throw new Error('Outside upload root');
            const bytes = await fs.readFile(file);
            res.setHeader('Content-Type', types[extension]);
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.end(req.method === 'HEAD' ? undefined : bytes);
          } catch { res.writeHead(404).end(); }
        });
        server.middlewares.use('/__page-data', async (req, res) => {
          const { routes, pageData } = await import('./scripts/content.mjs');
          const route = routes.find(item => item.url === decodeURI(req.url.split('?')[0]));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(route ? pageData(route) : {}));
        });
      },
      async transform(code, id) {
        if (!/\/src\/.*\.js$/.test(id)) return;
        if (!isSsrBuild && id.endsWith('/App.js')) {
          code = code.replace(/import (\w+)(?:,\s*\{([^}]+)\})? from "(\.\/(?:pages|components\/LegalPages)\/[^\"]+)";/g, (_, primary, named, source) => {
            const definitions = [`const ${primary} = React.lazy(() => import('${source}'));`];
            for (const name of (named || '').split(',').map(x => x.trim()).filter(Boolean)) definitions.push(`const ${name} = React.lazy(() => import('${source}').then(m => ({default:m.${name}})));`);
            return definitions.join('\n');
          });
        }
        return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
      },
    }, react(),
  ],
  build: { outDir: isSsrBuild ? '.ssr' : 'build', sourcemap: false, manifest: !isSsrBuild, assetsInlineLimit: 0 },
  server: { proxy: { '/api': { target: 'http://127.0.0.1:8000', changeOrigin: false } } },
}));
