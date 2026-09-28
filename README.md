# SYMC Modern Website & Admin CMS

New website and CMS for **SYMC — Superyacht Management & Consultancy** (https://www.symc.com.tr/).

Next.js 15 (App Router, React 19, TypeScript) · Tailwind CSS 4 · Prisma 6 · PostgreSQL · Tiptap · sanitize-html · image-size

> Content is migrated 1:1 from the live symc.com.tr (see `docs/AUDIT-AND-MIGRATION.md`). Nothing was invented: unknown values are left empty and are never rendered.

## Quick start (local)

```bash
npm install
cp .env.example .env            # set DATABASE_URL / DIRECT_URL (+ ADMIN_EMAIL / ADMIN_PASSWORD for the first admin)
npx prisma migrate deploy       # or `npm run db:migrate` while developing
npm run db:seed                 # verified SYMC content + 38 images → storage/media
npm run dev                     # http://localhost:3300 — admin at /admin/
```

| Script | Purpose |
|---|---|
| `npm run build` / `start` | `prisma generate` + production build / serve on :3300 |
| `npm run typecheck` / `lint` | `tsc --noEmit` / ESLint (next/core-web-vitals + typescript) |
| `npm run db:seed` | Idempotent, create-only seed (never overwrites admin edits, never deletes) |
| `npm run admin:create` | Create/reset an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars |
| `npm run seo:check -- <base-url>` | SEO QA of the server HTML (see below) |

## Architecture

```
src/
  app/(site)/            public site (ISR, revalidate 1h + on-demand purge from the admin)
    page.tsx             /
    about/               /about/
    services/            /services/                 (new hub)
    [...path]/           /<service-slug>/  → service detail at the ROOT (legacy URLs kept)
                         any other path    → DB redirect if one exists, else real 404
    completed-projects/  /completed-projects/ and /completed-projects/<slug>/
    news/                /news/ and /news/<slug>/
    contact/             /contact/ (+ server action contact form)
  app/admin/             CMS (dynamic, noindex, server-side auth)
  app/media/[...path]    serves uploaded media from storage (immutable caching)
  app/sitemap.xml        sitemap index → app/sitemaps/[name] (pages, services, projects, news)
  app/robots.ts, app/feed (RSS at the legacy /feed/ URL)
  lib/seo/
    site.ts              canonical origin (https://www.symc.com.tr) + URL helpers
    metadata.ts          buildMetadata(): title, description, canonical, robots, OG, Twitter
    json-ld.ts           connected @graph builders (Organization, WebSite, WebPage, Breadcrumb, ImageObject, CreativeWork, Service, BlogPosting, ItemList)
    image-meta.ts        real width/height/MIME from file headers (cached, no re-encoding)
    image-header.ts      magic-byte MIME sniffing + header parsing (shared with seed/QA)
    sitemap.ts           sitemap data + XML (image extension, real lastmod)
  lib/data/              typed public queries (published-only)
  lib/auth/              DB sessions, bcrypt, rate limiting
  lib/storage/           media storage driver (local filesystem; swap for S3/R2 here)
  lib/content/           sanitiser + slugify
  lib/redirects/legacy.ts  old symc.com.tr URL → new URL map (301)
prisma/                  schema, migrations, seed (+ seed-content.ts = verified SYMC content, seed-assets/ = images)
scripts/                 seo-check.ts, create-admin.ts, asset-prep/ (one-off image migration)
```

### Data model
`AdminUser`, `AdminSession`, `Media`, `ProjectCategory`, `Project`, `ProjectImage`, `Service`, `ServiceImage`,
`BlogCategory`, `BlogPost`, `SiteSetting` (singleton), `Redirect`, `ContactMessage`.
Images are **never** stored in PostgreSQL — `Media` holds metadata (real dimensions, MIME, alt, caption) and a storage key.

### SEO
* All SEO is server-rendered in the initial HTML for every user agent (`htmlLimitedBots: /.*/` — no bot-specific rendering).
* One canonical origin, `https://www.symc.com.tr` (verified: apex 301 → www). `SITE_URL` may override it for staging but localhost/IP/http values are rejected.
* Indexable pages: `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`. Admin, 404 and the empty news listing: `noindex`.
* JSON-LD graph with stable ids: `/#organization`, `/#logo`, `/#website`, `<page>#webpage`, `#breadcrumb`, `#primaryimage`, `#project` (CreativeWork), `#service` (Service → provider Organization), `#article` (BlogPosting).
* The same primary image is used for the visible hero, `og:image` and `#primaryimage`, with real width/height/type.
* Changing the slug of published content automatically adds a 301 (no chains).

### Security
* Server-side auth on every admin page (layout) and **every** server action (`requireAdmin()`); middleware is only a fast pre-check.
* bcrypt (cost 12) passwords, random 256-bit session tokens stored as SHA-256 hashes, httpOnly/secure/sameSite cookies scoped to `/admin`, 12 h expiry.
* Login throttling (per IP + per e-mail) and account lock after 8 failures.
* Zod validation of every mutation; rich text sanitised on save **and** on render; uploads validated by magic bytes (JPEG/PNG/WebP/AVIF only, ≤15 MB, ≤12 000 px), SVG rejected, storage keys whitelisted against path traversal.
* Security headers (nosniff, frame options, referrer policy, HSTS, permissions policy); `X-Robots-Tag: noindex` + `no-store` on `/admin`.

## QA

```
npm run typecheck && npm run lint && npm run build
npm run start & npm run seo:check -- http://localhost:3300
```
`seo:check` verifies, for every sitemap URL: status, title, description, absolute self-canonical, robots, single H1, og:image with **real** dimensions, JSON-LD graph integrity (no dangling ids), breadcrumbs, primary image in the server HTML, CreativeWork/Service/BlogPosting entities, alt text, identical HTML for browser/Googlebot/Googlebot-Image, 404s, legacy redirects, robots.txt and a crawl of every internal link and image.

## Deployment checklist (not done — production untouched)
1. Provision PostgreSQL (e.g. Neon): set `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
2. Set `MEDIA_STORAGE_DIR` to a **persistent** directory (or implement the S3/R2 driver in `src/lib/storage`). Back it up with the DB.
3. `npx prisma migrate deploy`, then `npm run db:seed` once (copies the 38 migrated images into storage).
4. `ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create` (then remove the vars).
5. `npm run build && npm run start` behind Nginx/Cloudflare with HTTPS; keep the apex → `https://www.symc.com.tr/` 301.
6. Configure an e-mail notification for contact messages if desired (messages are stored in the admin inbox; no SMTP is wired).
7. After DNS cut-over: submit `https://www.symc.com.tr/sitemap.xml` in Search Console, run `seo:check` against production, monitor 404s.
