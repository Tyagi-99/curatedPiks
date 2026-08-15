# CuratedPicks — Trust, product pages, and SEO

Date: 2026-08-15
Status: approved in conversation; waiting for spec review
Source of truth: `/home/tyagi/Downloads/CuratedPicks` (matches https://curated-piks.vercel.app/)
Out of scope for this spec: homepage redesign, `/guides` architecture, AdSense code, analytics overhaul, framework migration

## Goal

Turn the live reel-to-store catalogue into a useful product-discovery page per item, with honest trust pages and correct technical SEO — without changing the visual identity (Manrope + Instrument Serif, existing color tokens, rounded cards, store badges, sticky retailer CTA).

Success looks like:

- Every published product page still has independent value if affiliate buttons are removed.
- A teammate can open any of the 18 demo products and see a complete review-style layout they can copy.
- Google-facing metadata, canonicals, sitemap, robots, and JSON-LD match visible content and do not invent ratings, stock, or brand.

## Decisions already locked

| Decision | Choice |
|---|---|
| Codebase | `/home/tyagi/Downloads/CuratedPicks` |
| First slice | Trust pages + product-page system + SEO. Homepage only light additions. |
| Data approach | Extend `Product` with optional columns (Approach A). No editorial side table. |
| Voice | Hybrid. Homepage keeps “from my reels / Instagram videos.” About, How We Review, product pages, and legal speak as CuratedPicks (“we”), not a named founder. |
| Demo catalog | Fill all new editorial fields with unique sample copy derived from existing seed facts. Keep current seed prices and compare-at amounts. No fake ratings, testimonials, “we tested this,” or “Editor’s Choice.” |
| Visual identity | Preserve. Change information architecture on the product page, not the design system. |

## Data model

Keep every existing `Product` column.

Add:

| Column | Prisma type | Default | Public? |
|---|---|---|---|
| `brand` | `String` | `""` | Yes, omitted if empty |
| `quickVerdict` | `String` | `""` | Yes |
| `whyFeatured` | `String` | `""` | Yes |
| `highlightsJson` | `String` | `"[]"` | Yes (string array) |
| `bestForJson` | `String` | `"[]"` | Yes |
| `notForJson` | `String` | `"[]"` | Yes |
| `finalVerdict` | `String` | `""` | Yes |
| `editorialNotes` | `String` | `""` | Admin only |

Reuse, do not duplicate:

- `prosJson` / `consJson` — pros and cons
- `featuresJson` — specifications object `{ "Battery": "About 40 hours", ... }` (admin already edits as `Label: value` lines)
- `priceInr`, `compareAtInr`, `lastPriceCheckedAt` — price block
- `imageUrl`, `ogImageUrl` — hero + optional second thumb
- `store` + `affiliateUrl` (+ amazon/flipkart/network mirrors) — retailer CTA
- `updatedAt` — page last updated if needed; price line uses `lastPriceCheckedAt`
- Site setting `disclosure` — on-page affiliate sentence
- Alternatives — query 2–4 other `published` products in the same `categoryId`, ordered by `pinnedToBio desc`, `sortOrder asc`. No join table.

Do not add: ratings, review counts, stock enums, “editor’s choice” flags, image gallery table, per-product disclosure column.

Migration: additive SQLite migration. Existing rows get empty defaults, then seed upserts fill the 18 demo products.

## Demo content rule

For each of the 18 seeded products, write unique copy:

- `quickVerdict` — one sentence, who it is for, using facts already in title/shortDescription/pros.
- `whyFeatured` — 2–4 sentences. Frame as curation (“why this is on the list”), never as a lab test or personal wear-test.
- `highlightsJson` — 3–5 bullets taken from existing claims (battery, size, included extras).
- `bestForJson` / `notForJson` — 2–4 items inferred from existing pros/cons (e.g. bulky headphones → skip if you need something that disappears in a small bag).
- `featuresJson` — 4–8 spec pairs parsed from existing copy only (e.g. AirWave Pro: noise cancelling, ~40-hour battery). Do not invent wattage, IP ratings, or materials the seed never stated.
- `finalVerdict` — 1–2 sentences, distinct from `quickVerdict`.
- `brand` — use the product’s own invented brand token already in the title (AirWave, PixelView, BrewMaster, …). Do not set brand to “CuratedPicks”.
- `editorialNotes` — exactly `SAMPLE DEMO COPY — replace before publishing a real product.`
- Prices — leave `priceInr` and `compareAtInr` as they are in the current seed. Set `lastPriceCheckedAt` to a fixed seed timestamp so the “Last updated” line has a date.

If a future real product is saved with empty editorial fields, the corresponding public sections are omitted. The demo seed will not be empty.

## Product page

File: `src/app/p/[slug]/page.tsx` plus small presentational pieces if the file gets long (`ProductReviewSections`, `PriceBlock`, `AffiliateDisclosure`).

Keep: max-width article, rounded image, store badge, category chip, `ShareActions`, sticky `/go/...` CTA, related cards using existing `ProductCard`.

Section order (omit a block when its data is empty):

1. Breadcrumb: Home → category → product title
2. Image (`imageUrl`). If `ogImageUrl` is different, show it as a second thumb only (not a JS gallery)
3. Store badge, discount chip only when `compareAtInr > priceInr`, category chip
4. `h1` title. Brand as a quiet line under the title when `brand` is set
5. Short description
6. Quick verdict
7. Price block: current ₹, optional compare-at, always the sentence “Prices and availability can change. Check the retailer for the latest price.” Always a “Last updated: D MMM YYYY” line in `en-IN` from `lastPriceCheckedAt` when present
8. Primary CTA (also sticky at bottom)
9. Why we featured it
10. Key highlights
11. Pros and cons as two lists (restore cons; today production maps `prosJson` to “Features” and hides cons)
12. Who should consider it / Who should skip it
13. Specifications definition list from `featuresJson`
14. Alternatives (“You might also like”) — existing card component, 2–4 items
15. Final verdict
16. Affiliate disclosure paragraph from settings

CTA copy (not “Buy now”):

- Amazon → “View on Amazon”
- Flipkart → “View on Flipkart”
- Other known store → “View on {Store}”
- Fallback → “Check latest price”

`BuyButtons` and homepage/category cards that currently say “Buy on {Store}” switch to the same labels so the site is consistent.

Disclosure on the product page (CuratedPicks voice):

> Some links on CuratedPicks are affiliate links. If you purchase through them, we may earn a commission at no additional cost to you.

Update the legal affiliate page so it no longer claims disclosure appears only on `/legal/affiliate`.

## Trust pages

### About (`/about`)

Replace the two-paragraph stub. Same layout shell and type scale. Sections:

- What CuratedPicks is (product pages for things featured in the reels, plus a written take)
- Why it exists (a stable URL after a comment “link”, not a DMs-only shop)
- What we cover (the live categories: Tech, Home, Fitness, Fashion, Beauty)
- How products are discovered (Instagram/Facebook comments and DMs, then a shortlist)
- How we choose (summary + link to `/how-we-review`)
- How information is researched (retailer listings, published specs, publicly available customer feedback — not a claim of in-house testing)
- How affiliate links work (link to `/legal/affiliate`)
- Corrections and contact (`/contact` and `hello@curatedpicks.com`)

No founder bio, employee count, years of experience, or “we personally test every product.”

### How we review (`/how-we-review`)

New App Router page, same `SiteShell`. Indexable. Outline:

1. Product discovery
2. Product research
3. Feature comparison
4. Value assessment
5. Pros and cons
6. Alternatives
7. Price and availability checks
8. Editorial updates
9. Corrections

State clearly: affiliate relationships do not decide what is recommended. Link from About, footer Browse, and a short “How we choose” strip on the homepage.

### Legal

Canonical URLs stay `/legal/affiliate`, `/legal/privacy`, `/legal/terms`, `/legal/cookies`.

Add 308 redirects in `next.config.ts`:

- `/privacy` → `/legal/privacy`
- `/terms` → `/legal/terms`
- `/cookies` → `/legal/cookies`
- `/affiliate-disclosure` → `/legal/affiliate`

Fix the legal renderer so `## Heading` followed by a single newline becomes an `h2` plus a separate paragraph. Today a heading and its first paragraph collapse into one `h2`.

Revise `LEGAL_PAGES` (and therefore the seed/upsert) to:

- Use CuratedPicks/we voice
- Mention on-page product disclosures
- Name the contact email already in settings
- Drop the sentence that forbids repeating commission language on product pages
- Keep Indian-law privacy wording already present; do not add new legal claims

Contact page stays. Remove the “Coming soon” WhatsApp box if `whatsappUrl` is empty — do not show a dead placeholder.

Footer Browse adds About (already there) and How we review.

## SEO and structured data

Per public page:

- Unique `title` and `meta description` (product: `{title} — {store}` already exists; add a real description from `shortDescription` or `quickVerdict`)
- `alternates.canonical` using `siteUrl()` + path without `?src=`
- Open Graph + Twitter `summary_large_image` on products (already partly there). Add site-wide OG on the root layout from settings
- `robots`: keep allow `/`, disallow `/admin`. Do not noindex public pages

Sitemap additions (`src/app/sitemap.ts`):

- `/how-we-review`
- `/legal/affiliate`, `/privacy`, `/terms`, `/cookies`
- published blog posts (`/blog/{slug}`)

JSON-LD (must match visible content):

- Root layout: `Organization` + `WebSite` (name CuratedPicks, url `siteUrl()`, no fake logo/sameAs unless Instagram/Facebook settings are real URLs — not `https://instagram.com/`)
- Product page: `BreadcrumbList` + `Product`. `brand` only if `product.brand` is set. `offers.price` and `priceCurrency` only if `priceInr > 0`. **Do not** emit `availability: InStock`. **Do not** emit aggregateRating. **Do not** set brand to CuratedPicks
- Category and `/links`: `ItemList` of visible products
- About / How we review: no `Review` schema

404: add `src/app/not-found.tsx` inside `SiteShell` — short message + link home and `/#shop`.

Treat `instagramUrl === "https://instagram.com/"` (and the same with trailing slash) as unset. Do not render a Follow/Instagram CTA to the bare Instagram homepage.

## Homepage (light only)

Do not replace Featured / Everything featured / Recently added / Popular.

Add after Popular:

- A short “How we choose products” band (3–4 lines + link to `/how-we-review`)
- Follow us only if a real Instagram or Facebook URL is set
- Rely on the existing footer disclosure (rewritten to CuratedPicks/we voice)

Hero copy stays reel-first (“Products Featured In My Videos”).

## Admin and data flow

`ProductForm` gains fields matching the new columns (textareas for arrays, one item per line). Specs stay `Label: value` lines.

`saveProduct`:

- Persists the new fields via existing `toJsonList` / specs parser
- Updates `lastPriceCheckedAt` only when `priceInr` or `compareAtInr` changed; otherwise keep the previous timestamp
- Revalidate `/`, `/links`, `/p/[slug]`, `/c/[category]`, `/sitemap.xml`

Editors can draft unpublished products. Only ADMIN can publish and edit affiliate URLs (existing rule).

## Security (in this slice)

`/go/[productId]/[merchant]`:

- Resolve the URL as today
- Redirect only if the target is `http:` or `https:`
- Otherwise 302 to `/` (same as missing product)

No new secrets. Do not put `AUTH_SECRET` in client code. `rel="sponsored nofollow noopener noreferrer"` stays on retailer anchors.

Contact form: keep server-side required fields; do not echo unsanitized HTML (already plain text).

## Error handling

- Unpublished or unknown slug → `notFound()`
- Empty editorial field → omit section (after demo seed, sections are present)
- No retailer URL → existing “Buy links will appear here once they are added.”
- Invalid `/go` target → home
- Legal unknown slug → `notFound()`

## Testing and verification

No new test runner. Before calling the slice done:

1. `pnpm exec tsc --noEmit` and `pnpm lint` in this repo
2. `pnpm build` if the environment allows (SQLite seed/build path already used on Vercel)
3. Manual: one product page shows every section; clearing `quickVerdict` in admin hides that section
4. Manual: `/how-we-review`, `/about`, `/legal/affiliate` headings parse correctly
5. Manual: `/privacy` redirects to `/legal/privacy`
6. Manual: `/sitemap.xml` lists products, categories, legal, how-we-review
7. View-source: product JSON-LD has no `aggregateRating` and no `InStock`
8. Affiliate click still hits `/go/...` and records a `Click`

## Explicitly not in this slice

- New `/guides`, `/reviews`, `/comparisons` routes (blog already exists; leave it)
- AdSense snippets or new ad slot layout
- Search/filter rewrite (ShopGrid stays)
- `next/image` migration
- Wiring the unused `Redirect` admin table
- Inventing a real Instagram/Facebook URL
- Claiming AdSense readiness or Google approval

Those stay later slices.

## Files expected to change

- `prisma/schema.prisma`, new migration, `prisma/seed.ts`
- `src/app/p/[slug]/page.tsx`, `src/components/public/BuyButtons.tsx`
- `src/app/about/page.tsx`, new `src/app/how-we-review/page.tsx`, `src/app/legal/[slug]/page.tsx`, `src/lib/legalPages.ts`
- `src/app/sitemap.ts`, `src/app/layout.tsx`, new `src/app/not-found.tsx`, `next.config.ts`
- `src/app/page.tsx` (light band only), `src/components/public/Header.tsx` / `Footer.tsx`
- `src/components/admin/ProductForm.tsx`, `src/app/actions/admin.ts`
- `src/app/go/[productId]/[merchant]/route.ts`
- `src/lib/settings.ts` (disclosure default + treat bare Instagram as empty)

## Implementation order

1. Schema migration + seed copy for all 18 products
2. Product page + BuyButtons labels + disclosure
3. Admin form + saveProduct
4. About, How we review, legal parser + copy, redirects
5. SEO metadata, sitemap, JSON-LD, 404
6. Homepage band + footer/header links
7. `/go` http(s) guard
8. Verification list above
