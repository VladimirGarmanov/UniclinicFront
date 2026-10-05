# Uniclinic frontend

Existing React design/content with static HTML generation, per-route JavaScript and
same-origin forms. Node 24 (`.nvmrc`); npm lockfile contains exact versions.

## Local production preview

```bash
npm ci
npm run build
npm run preview
```

Open **http://127.0.0.1:4173**. Start the backend in a second terminal using
`../UniclinicBack/README.md`. Production is not contacted by the local form handlers.

`npm run dev` starts Vite on loopback for code editing; it is a development SPA. Use
`npm run preview` for actual generated HTML, response codes, compression and cache headers.
Rebuild/restart preview after changes to the route catalogue. A rebuild also regenerates
sitemap, metadata, responsive images and nginx routing maps.

## Architecture

- `src/pages` retains existing React components and medical text.
- `src/assets/info` is the supplied CMS snapshot, kept out of client JavaScript.
- `scripts/content.mjs` derives URLs and page-specific hydration data; contact fields are
  excluded from question/review exports. Raw source JSON is never copied to `build`.
- `scripts/build.mjs` renders every known URL into its own HTML using React on Node.
  Browsers and crawlers receive the same HTML, without user-agent branching.
- `vite.config.js` splits components by route. JSON imports resolve to the current
  document's data in the browser and sanitized CMS data during server rendering.
- Navigation uses full document requests so server status, title and canonical match
  every destination. Interactive forms, filters, calculator and modal hydrate normally.
- `scripts/serve.mjs` provides local HTTP 200/301/404/405, security headers, Brotli/gzip
  negotiation and loopback API proxying. This is a local preview, not production hosting.
- HTML includes page CSS immediately, metadata, canonical, Open Graph and JSON-LD.
  Sitemap dates use real CMS timestamps when available; build dates are not fabricated.
- Images keep their original files; Sharp generates 400/800/1280px WebP derivatives,
  srcset, dimensions and lazy loading. The derivative cache lives in `.generated`.
- `src/config/urls.js` is the shared redirect and normalization map.
- `src/config/site.js` is the contact configuration. Hours/email currently use the existing
  header/footer values; owner confirmation is still required before publication.
- `src/utils/analytics.js` emits only local technical events; no analytics vendor is
  configured. There are no patient fields, query strings or raw errors in those events.

The original `public/upload` contains suspicious PHP and other non-media artifacts.
The build uses an allowlist and excludes executable/hidden/tmp files, archives and CSV.
Originals remain available for investigation. `deploy/upload-review.json` records hashes
of PHP files with obfuscation markers. Never publish the source `public` directory directly.
Only publish a reviewed `build` artifact. `routes.json`, build reports, `.vite` and nginx
maps are build/deployment metadata, and both preview and nginx keep them inaccessible.

## Content handling and remaining inputs

Medical text is not rewritten. Three previously broken treatment URLs now use their
existing homepage summaries; no missing long-form treatment text was invented.
`/about` redirects to the homepage because the source contained only `About`.
The absent video footer link and generic social-network homepage links are removed.
Two related-doctor references lack doctor pages in the supplied export, and the linked
`colon-russian-patient.pdf` is absent. Their visible text is retained without broken links;
restore links when the corresponding approved materials are provided. Known disease URL
spelling mistakes have explicit redirects. Existing valid content paths are preserved.
Historical question/review contact fields are omitted from delivered data; historical
medical narratives still require the clinic's publication/privacy review.

## Small release check

```bash
npm run check
```

Checks generated content/H1/lang/title/canonical, JSON-LD syntax, internal page links and
a 1 MB budget for *all* client JavaScript chunks combined. It is not a broad browser suite.
The build report includes page/image counts, excluded files and unresolved internal URLs.
No Lighthouse field metrics, external schema certification or production HTTP/2 claim is
implied by a local build. Mobile CWV must be measured after a real staging/production run.

## Prepared deployment

Target: **https://uniclinic.pro**, SSH **root@194.156.116.81**, **Ubuntu 24.04**.
See [the Russian installation guide](deploy/README.md) for GitHub push, clone, database
selection and `python3 deploy/server.py deploy`. The installer builds both repositories,
configures nginx/HTTPS/systemd, and provides `update`, `rollback`, `backup` and `status`.
No production server, DNS, counters or search-console accounts have been changed.
