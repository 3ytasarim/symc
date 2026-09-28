# SYMC — existing site audit, reference review & URL migration map

Audit date: 2026-09-28. Source: live https://www.symc.com.tr/ (HTML, WordPress REST API, WP sitemaps, media library, the "SYMC Completed Projects" PDF) and the Wayback Machine CDX index.

## 1. Existing site (symc.com.tr)

* **Platform:** WordPress + Flatsome theme, PHP 7.4, LiteSpeed Cache. `lang="en-US"`, English only (no localisation → none added).
* **Canonical host:** `https://symc.com.tr/` → **301** → `https://www.symc.com.tr/`; pages carry `rel=canonical` on `https://www.symc.com.tr/…/` (trailing slash). The new site keeps this exact origin and URL shape.
* **SEO state:** no meta descriptions, no Open Graph, no structured data, homepage without an `<h1>`, `/news/` is an empty "Nothing Found" page, sitemap lists an internal Flatsome block (`/blocks/footer-about-us/`), images have empty alt text and camera/WhatsApp file names.
* **Pages (WP sitemap, with real lastmod):**

| URL | Title | lastmod |
|---|---|---|
| `/` | SYMC YACHT – Superyacht Management&Consultancy | 2022-08-18 |
| `/about/` | About | 2022-08-18 |
| `/new-construction/` | New Construction | 2022-08-18 |
| `/project-management-and-consultancy/` | Project Management and Consultancy | 2022-08-18 |
| `/retrofit-refit-services/` | Refit Services | 2022-08-18 |
| `/yacht-management-service/` | Yacht Management Service | 2022-08-18 |
| `/completed-projects/` | Completed Projects | 2026-01-16 |
| `/news/` | News (empty — 0 posts in the REST API) | 2022-08-06 |
| `/contact/` | Contact | 2026-06-02 |
| `/blocks/footer-about-us/` | (Flatsome block, no content) | 2022-08-18 |

* **Company facts used (verbatim sources):** founded 2020; 25+ years experience as marine surveyor & project manager; 24/7 service; address *İstasyon Mah, Çiçekçiler Cad. No:21/D Tuzla/İstanbul*; Mon–Fri 8am–6pm; +90 549 301 17 03; info@symc.com.tr; Instagram `symc_official`; LinkedIn company page; WhatsApp +90 549 301 17 03; Google Maps place "SYMC Yacht".
* **Projects (10):** M/Y Mereley 35m (new construction, in progress, Kocaeli), TISG new construction projects (8 hulls, 24–100 m), refits: M/Y MMM 49.2m (2024), M/Y Starburst III 47m (2023), M/Y Ileria 50m (2022), M/Y Mystere AB (2022), M/Y Duke Town 36.5m (2021, still managed by SYMC), M/Y Secret 47m (2021), M/Y 4You 47m (2020), Ferretti Custom Line Navetta 42 "Nimir" (year not stated). Scope lists migrated item by item.

### Discrepancies found on the live site (need confirmation by SYMC)
1. **Address:** the contact page says *Çiçekçiler Cad. No:21/D*; a floating-button plugin uses *Şehitler Cad. No:73 iç kapı no:2*. The contact-page address is used.
2. **E-mail:** contact page shows `info@symc.com.tr`; header/footer icons link to `hustun@symc.com.tr`. `info@` is used.
3. **Mereley location:** website says Kocaeli, the 2024 PDF says Tuzla–Istanbul. The (newer) website text is used.
4. Two LinkedIn URLs exist (company page + a personal-style `/in/` profile). The company page is used.

### Image attribution rules
Project images are linked to a project only when verifiable: (a) placed in that project's row on `/completed-projects/`, (b) on that project's page of the Completed Projects PDF, or (c) the yacht name is visible on the hull (`4YOU`, `DUKE TOWN`). All other field photos are used as generic service imagery without naming a yacht. Mereley images are labelled as design *visuals* (they are renders). Stock photos were not added, except the homepage hero that the current site already uses.

## 2. Norm Yacht reference (3ytasarim/Norm-Yacht — read only, not modified)

Vite + React + Express + Drizzle, shadcn/ui, Montserrat, orange/navy. Reviewed: centred-logo header with services dropdown, mobile drawer, hero slider, stats band, service/project card grids, project detail with carousel + lightbox, SSR SEO module (`server/ssr.ts`, JSON-LD with Organization @id, breadcrumbs, hreflang).

**Adapted (re-implemented, not copied):** sticky header + services dropdown + full-screen mobile menu; stats band (only real numbers); service & project listing → detail → gallery flow; keyboard lightbox; SSR SEO with `@id`-linked Organization and BreadcrumbList.
**Deliberately not taken:** orange/navy palette, Montserrat, rounded cards/shadows, hero slider (single LCP-optimised image instead), top info bar, client-side data fetching.
**SYMC identity:** colours sampled from the SYMC sails logo (red `#EF3A3B`, blue `#0073BD`) used only as accents on deep navy / warm paper; Instrument Serif display + Inter Tight + JetBrains Mono; square geometry, hairlines, editorial grids, full-bleed photography; the two-sail mark as section marker.

RockDrill Agora (3ytasarim/RockDrillAgora) was reviewed for the legacy-redirect and sitemap-coverage test approach. The Mezbaha Teknolojileri repository is not in the account; the SEO architecture was built to the specification (`lib/seo/site | metadata | json-ld | image-meta`).

## 3. URL migration map

**KEEP (identical URL, 200):** `/`, `/about/`, `/new-construction/`, `/project-management-and-consultancy/`, `/retrofit-refit-services/`, `/yacht-management-service/`, `/completed-projects/`, `/news/` (noindex until articles exist), `/contact/`, `/feed/` (now a real RSS feed).

**NEW:** `/services/`, `/completed-projects/<project>/` (10 case studies), `/news/<article>/`, `/sitemap.xml` (index) + `/sitemaps/*.xml`, `/media/…` (semantic image URLs).

**301 redirects** (`src/lib/redirects/legacy.ts`):

| Old | New |
|---|---|
| `/blocks/footer-about-us/` | `/about/` |
| `/home/` | `/` |
| `/wp-sitemap.xml`, `/wp-sitemap-posts-page-1.xml`, `/wp-sitemap-posts-blocks-1.xml`, `/wp-sitemap-index.xsl` | `/sitemap.xml` |
| `/wp-content/uploads/…` (46 URLs: 38 migrated images incl. WP resized variants seen in the live HTML, + 3 logo files) | `/media/<semantic-path>.jpg` / `/brand/symc-logo.png` |

**Real 404 (no redirect to home):** `/wp-admin/`, `/wp-login.php`, `/xmlrpc.php`, `/comments/feed/`, `/wp-json/*`, unused uploads, pre-2022 static assets (`/css/*`, `/js/*`, `/gallery_gen/*`), any unknown URL.

Slug changes made later in the admin automatically create 301s (Redirect table); manual redirects can be added under *Admin → Redirects & SEO*.
