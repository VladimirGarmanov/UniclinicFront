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
- `src/config/site.js` is the contact configuration. Hours/email use the existing
  header/footer values accepted by the owner on 2026-10-10.
- `src/utils/analytics.js` emits only local technical events; no analytics vendor is
  configured. There are no patient fields, query strings or raw errors in those events.

The original `public/upload` contains suspicious PHP and other non-media artifacts.
The build uses an allowlist and excludes executable/hidden/tmp files, archives and CSV.
Originals remain available for investigation. `deploy/upload-review.json` records hashes
of PHP files with obfuscation markers. Never publish the source `public` directory directly.
Only publish a reviewed `build` artifact. `routes.json`, build reports, `.vite` and nginx
maps are build/deployment metadata, and both preview and nginx keep them inaccessible.

## Content handling and remaining inputs

The source CMS JSON remains intact. `scripts/editorial.mjs` applies targeted corrections,
removes irrelevant shared blocks and separates priority disease/service pages. FAQ answers
are rendered in HTML; medical answers on the hemorrhoid pages link to their sources.
No medical reviewer/date is invented. Add completed reviews to `src/config/editorial.js`
using an existing `reviewerCode`, `reviewedAt` and optional sources.

Existing clinic facts and prices were accepted by the owner on 2026-10-10. Prices come
only from the existing price table; page-to-price mappings are in `ServicePrices.js`.
The five new service pages live in `src/config/service-landings.js`. Future unpublished
entries stay out of production builds; `PREVIEW_DRAFTS=true npm run build` includes
those drafts with noindex for editorial preview. Drafts never enter the public list/sitemap.

The shared header, responsive WebP hero and route-specific JPEG social previews are
produced by one build. The homepage now reads full headlines and real publication dates
from the CMS snapshot. Social previews use content hashes and 1200×630 dimensions.
OMS/VMP/paid treatment use `/oms`, `/vmp`, `/paid-treatment`, with explicit old-URL redirects.

Appointment and callback forms use the same private API; `request_type` distinguishes
them in the admin panel. Medical documents are not requested by these forms. External
analytics, call tracking and SMTP delivery are not activated by this local change.

See [the 47-item implementation status](docs/seo-audit-2026-10-10.md) and
[the initial intent matrix](docs/search-intent.json). Remaining editorial/marketing inputs,
CWV measurements and production validation are distinguished from completed local code.

## Small release check

```bash
npm run check
npm run check:audit
# With preview and the local API running:
npm run check:http
```

Checks generated content/H1/lang/title/canonical, JSON-LD syntax, internal page links and
a 1 MB budget for *all* client JavaScript chunks combined. It is not a broad browser suite.
The build report includes page/image counts, excluded files and unresolved internal URLs.
No Lighthouse field metrics, external schema certification or production HTTP/2 claim is
implied by a local build. Mobile CWV must be measured after a real staging/production run.

## Prepared deployment

Target: **https://uniclinic.pro**, SSH **root@194.156.116.81**, **Ubuntu 24.04 или 26.04**.
See [the Russian installation guide](deploy/README.md) for GitHub push, clone, database
selection and `python3 deploy/server.py deploy`. The installer builds both repositories,
configures nginx/HTTPS/systemd, and provides `update`, `rollback`, `backup` and `status`.
No production server, DNS, counters or search-console accounts have been changed.

## Главная и редактор публикаций (11 октября 2026)

Сразу после первого экрана главной расположены Telegram, обратный звонок и вопрос
через сайт; обе формы доступны прямо на главной. Telegram ведёт на `@surgerymgu_bot`.
В `/questions/admin` добавлен редактор статей, клинических историй и новостей.
Для живой публикации нужен обновлённый backend и nginx из `deploy/`.

Новые материалы рендерятся backend в полный HTML, дополняют списки и sitemap без
пересборки. Архивные страницы остаются статическими. Сборка сохраняет публичный
`editorial-catalog.json` для объединения старого архива и новых материалов.
На главной новые публикации загружаются из `/api/publications`.

Самостоятельный бот находится в соседней папке `../TelegramBot`, со своим `.venv`,
`.env`, инструкциями и systemd-службой. Он не включён в frontend или backend.
