# Trust, Product Pages, and SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the live CuratedPicks storefront so every product page is a complete, honest review-style demo, trust pages exist, and technical SEO matches visible content.

**Architecture:** Additive Prisma columns on `Product`, pure helpers in `src/lib/` for parsing/CTA/URL guards, product page composed from existing `SiteShell` + new section components. Demo editorial copy lives in `prisma/editorialSeed.ts` and is merged during seed. No framework change.

**Tech Stack:** Next.js 16 App Router, Prisma + SQLite, React 19, Tailwind 4, Node built-in test runner (`node --test`).

## Global Constraints

- Work only in `/home/tyagi/Downloads/CuratedPicks` (live-site source of truth).
- Do not change the visual identity (fonts, color tokens, rounded cards, store badges).
- Homepage hero stays reel-first; About / How we review / product / legal use CuratedPicks “we” voice.
- Keep existing seed `priceInr` and `compareAtInr`. Do not invent new rupee amounts.
- No fake ratings, testimonials, “we tested this,” InStock, or brand = CuratedPicks.
- Demo `editorialNotes` must be exactly `SAMPLE DEMO COPY — replace before publishing a real product.`
- No AdSense code, no `/guides` routes, no `next/image` migration, no new test framework beyond `node --test`.
- CTA labels: “View on {Store}” for known stores, else “Check latest price”. Never “Buy now”.
- Treat `instagramUrl` of `https://instagram.com` or `https://instagram.com/` as unset.

---

## File map

| File | Responsibility |
|---|---|
| `src/lib/editorial.ts` | parseSpecs, formatUpdated, ctaLabel, DISCLOSURE_COPY |
| `src/lib/urls.ts` | isHttpUrl, isBareSocialHomepage, realSocialUrl |
| `src/lib/legalRender.ts` | split legal markdown into heading/paragraph blocks |
| `src/lib/json-ld.ts` | Organization, WebSite, Product, Breadcrumb, ItemList builders |
| `prisma/schema.prisma` | new Product columns |
| `prisma/migrations/20260815120000_editorial_fields/migration.sql` | additive SQLite columns |
| `prisma/editorialSeed.ts` | per-slug demo editorial overlay |
| `prisma/seed.ts` | merge overlay; set lastPriceCheckedAt |
| `src/app/p/[slug]/page.tsx` | product review layout + metadata + JSON-LD |
| `src/components/public/ProductReview.tsx` | section rendering, omit empty |
| `src/components/public/BuyButtons.tsx` | new CTA labels |
| `src/components/public/ProductCard.tsx` | “View on {Store}” if it currently says Buy |
| `src/components/admin/ProductForm.tsx` | new fields |
| `src/app/actions/admin.ts` | persist new fields; price-checked only on price change |
| `src/app/about/page.tsx` | full About |
| `src/app/how-we-review/page.tsx` | methodology |
| `src/lib/legalPages.ts` | disclosure copy fix |
| `src/app/legal/[slug]/page.tsx` | heading parser |
| `next.config.ts` | /privacy etc. redirects |
| `src/app/sitemap.ts` | legal + how-we-review + posts |
| `src/app/layout.tsx` | org/website JSON-LD, default OG |
| `src/app/not-found.tsx` | 404 |
| `src/app/page.tsx` | How we choose band |
| `src/components/public/Header.tsx` / `Footer.tsx` | real social only; how-we-review link |
| `src/app/go/[productId]/[merchant]/route.ts` | http(s) only |
| `src/lib/settings.ts` | disclosure default; bare IG treated empty |
| `src/app/contact/page.tsx` | hide empty WhatsApp |
| `src/lib/editorial.test.ts` | node:test helpers |
| `src/lib/urls.test.ts` | node:test URL guards |
| `src/lib/legalRender.test.ts` | node:test legal split |

---

### Task 1: Pure helpers + tests

**Files:**
- Create: `src/lib/editorial.ts`
- Create: `src/lib/urls.ts`
- Create: `src/lib/legalRender.ts`
- Create: `src/lib/editorial.test.ts`
- Create: `src/lib/urls.test.ts`
- Create: `src/lib/legalRender.test.ts`

**Interfaces:**
- Produces:
  - `parseSpecs(raw: string): { label: string; value: string }[]`
  - `formatUpdated(date: Date | null | undefined): string | null` — `en-IN` like `14 Aug 2026`
  - `ctaLabel(storeLabel: string, storeId: string): string` — `View on Amazon` / `Check latest price` for `custom`
  - `DISCLOSURE_COPY` constant
  - `isHttpUrl(value: string): boolean`
  - `isBareSocialHomepage(value: string): boolean`
  - `realSocialUrl(value: string | undefined | null): string | null`
  - `splitLegalBlocks(body: string): { type: "h2" | "p"; text: string }[]`

- [ ] **Step 1: Write failing tests**

`src/lib/editorial.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { ctaLabel, formatUpdated, parseSpecs } from "./editorial.ts";

test("parseSpecs reads Label: value lines from object JSON", () => {
  const rows = parseSpecs(JSON.stringify({ Battery: "About 40 hours", ANC: "Yes" }));
  assert.deepEqual(rows, [
    { label: "Battery", value: "About 40 hours" },
    { label: "ANC", value: "Yes" },
  ]);
});

test("parseSpecs returns empty on junk", () => {
  assert.deepEqual(parseSpecs("not-json"), []);
});

test("ctaLabel uses View on for named stores", () => {
  assert.equal(ctaLabel("Amazon", "amazon"), "View on Amazon");
  assert.equal(ctaLabel("Store", "custom"), "Check latest price");
});

test("formatUpdated uses en-IN day month year", () => {
  assert.equal(formatUpdated(new Date("2026-08-14T00:00:00.000Z")), "14 Aug 2026");
  assert.equal(formatUpdated(null), null);
});
```

`src/lib/urls.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { isBareSocialHomepage, isHttpUrl, realSocialUrl } from "./urls.ts";

test("isHttpUrl accepts only http(s)", () => {
  assert.equal(isHttpUrl("https://www.amazon.in/dp/x"), true);
  assert.equal(isHttpUrl("javascript:alert(1)"), false);
  assert.equal(isHttpUrl("/relative"), false);
});

test("bare Instagram homepage is empty", () => {
  assert.equal(isBareSocialHomepage("https://instagram.com/"), true);
  assert.equal(isBareSocialHomepage("https://instagram.com"), true);
  assert.equal(isBareSocialHomepage("https://instagram.com/curatedpicks"), false);
  assert.equal(realSocialUrl("https://instagram.com/"), null);
});
```

`src/lib/legalRender.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { splitLegalBlocks } from "./legalRender.ts";

test("splits heading plus following paragraph on a single newline", () => {
  const blocks = splitLegalBlocks("## Who we are\nCuratedPicks is independent.\n\nNext para.");
  assert.deepEqual(blocks, [
    { type: "h2", text: "Who we are" },
    { type: "p", text: "CuratedPicks is independent." },
    { type: "p", text: "Next para." },
  ]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /home/tyagi/Downloads/CuratedPicks && node --experimental-strip-types --test src/lib/editorial.test.ts src/lib/urls.test.ts src/lib/legalRender.test.ts`

Expected: FAIL (cannot find modules)

- [ ] **Step 3: Implement helpers**

`src/lib/editorial.ts`:

```ts
export const DISCLOSURE_COPY =
  "Some links on CuratedPicks are affiliate links. If you purchase through them, we may earn a commission at no additional cost to you.";

export const SAMPLE_EDITORIAL_NOTE =
  "SAMPLE DEMO COPY — replace before publishing a real product.";

export function parseSpecs(raw: string): { label: string; value: string }[] {
  try {
    const value = JSON.parse(raw) as unknown;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.entries(value as Record<string, string>)
        .map(([label, item]) => ({ label, value: String(item) }))
        .filter((row) => row.label && row.value);
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function formatUpdated(date: Date | null | undefined): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function ctaLabel(storeLabel: string, storeId: string): string {
  if (!storeId || storeId === "custom") return "Check latest price";
  return `View on ${storeLabel}`;
}
```

`src/lib/urls.ts`:

```ts
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isBareSocialHomepage(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname.replace(/\/$/, "");
    return (host === "instagram.com" || host === "facebook.com") && path === "";
  } catch {
    return false;
  }
}

export function realSocialUrl(value: string | undefined | null): string | null {
  if (!value) return null;
  if (!isHttpUrl(value) || isBareSocialHomepage(value)) return null;
  return value;
}
```

`src/lib/legalRender.ts`:

```ts
export function splitLegalBlocks(body: string): { type: "h2" | "p"; text: string }[] {
  const blocks: { type: "h2" | "p"; text: string }[] = [];
  for (const chunk of body.split(/\n\n+/)) {
    const lines = chunk.split("\n");
    if (lines[0]?.startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].replace(/^## /, "").trim() });
      const rest = lines.slice(1).join("\n").trim();
      if (rest) blocks.push({ type: "p", text: rest });
    } else if (chunk.trim()) {
      blocks.push({ type: "p", text: chunk.trim() });
    }
  }
  return blocks;
}
```

- [ ] **Step 4: Re-run tests**

Run: `cd /home/tyagi/Downloads/CuratedPicks && node --experimental-strip-types --test src/lib/editorial.test.ts src/lib/urls.test.ts src/lib/legalRender.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/editorial.ts src/lib/urls.ts src/lib/legalRender.ts src/lib/editorial.test.ts src/lib/urls.test.ts src/lib/legalRender.test.ts
git commit -m "Add editorial, URL, and legal helper tests."
```

---

### Task 2: Schema migration

**Files:**
- Modify: `prisma/schema.prisma` (`Product` model)
- Create: `prisma/migrations/20260815120000_editorial_fields/migration.sql`

**Interfaces:**
- Produces: Product columns `brand`, `quickVerdict`, `whyFeatured`, `highlightsJson`, `bestForJson`, `notForJson`, `finalVerdict`, `editorialNotes`

- [ ] **Step 1: Add columns to schema.prisma inside `model Product` after `featuresJson`**

```prisma
  brand              String    @default("")
  quickVerdict       String    @default("")
  whyFeatured        String    @default("")
  highlightsJson     String    @default("[]")
  bestForJson        String    @default("[]")
  notForJson         String    @default("[]")
  finalVerdict       String    @default("")
  editorialNotes     String    @default("")
```

- [ ] **Step 2: Write migration.sql**

```sql
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "brand" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "quickVerdict" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "whyFeatured" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "highlightsJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "bestForJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "notForJson" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Product" ADD COLUMN "finalVerdict" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "editorialNotes" TEXT NOT NULL DEFAULT '';
```

- [ ] **Step 3: Apply locally**

Run: `cd /home/tyagi/Downloads/CuratedPicks && pnpm exec prisma migrate deploy && pnpm exec prisma generate`

Expected: migrate apply + client generated

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/20260815120000_editorial_fields/migration.sql
git commit -m "Add Product editorial fields."
```

---

### Task 3: Demo editorial seed for all 18 products

**Files:**
- Create: `prisma/editorialSeed.ts`
- Modify: `prisma/seed.ts` — merge overlay on each product; `lastPriceCheckedAt: new Date("2026-08-14T00:00:00.000Z")`

**Interfaces:**
- Consumes: `SAMPLE_EDITORIAL_NOTE` from `src/lib/editorial.ts` (or duplicate the string in seed to avoid importing from `src` if seed path is awkward — prefer importing).
- Produces: `EDITORIAL_BY_SLUG: Record<string, EditorialOverlay>` covering every seeded slug.

Overlay shape:

```ts
export type EditorialOverlay = {
  brand: string;
  quickVerdict: string;
  whyFeatured: string;
  highlightsJson: string; // JSON.stringify(string[])
  bestForJson: string;
  notForJson: string;
  finalVerdict: string;
  featuresJson: string; // JSON.stringify(Record<string,string>)
  editorialNotes: string;
};
```

Every product already in `seed.ts` must have an overlay. Specs and highlights may only restate facts already in that product’s title, shortDescription, description, pros, or cons. Do not add IP ratings, wattage, or materials the seed never stated. Do not change `priceInr` / `compareAtInr`.

Example AirWave overlay (repeat unique copy for the other 17):

```ts
"airwave-pro-headphones": {
  brand: "AirWave",
  quickVerdict: "Best suited for commuters who want strong noise cancelling and about 40 hours between charges.",
  whyFeatured: "This is the pair we send most often after a reel: listed noise cancelling that holds up on a metro, and a battery claim that means you are not charging every night. We featured it as a daily-carry headphone, not a studio monitor.",
  highlightsJson: JSON.stringify([
    "Listed as wireless ANC",
    "About 40 hours between charges",
    "Described as comfortable for long sessions",
  ]),
  bestForJson: JSON.stringify([
    "People who commute or sit in noisy rooms",
    "Anyone who wants fewer charging days",
  ]),
  notForJson: JSON.stringify([
    "Anyone who needs a pair that disappears in a small bag",
    "Listeners who want wired ANC",
  ]),
  finalVerdict: "A commuter headphone if the listed ANC and battery matter more than packed size.",
  featuresJson: JSON.stringify({
    "Noise cancelling": "Yes (ANC, listed)",
    "Battery": "About 40 hours",
    "Fit": "Over-ear; bulky in a small bag",
    "Wired ANC": "No",
  }),
  editorialNotes: "SAMPLE DEMO COPY — replace before publishing a real product.",
},
```

- [ ] **Step 1: Author `prisma/editorialSeed.ts` with all 18 slugs**
- [ ] **Step 2: In seed.ts, after building each product object, `...EDITORIAL_BY_SLUG[product.slug]`, and set `lastPriceCheckedAt`**
- [ ] **Step 3: Run seed**

Run: `cd /home/tyagi/Downloads/CuratedPicks && pnpm db:seed`

Expected: `Seeded admin ... and 18 products`

- [ ] **Step 4: Commit**

```bash
git add prisma/editorialSeed.ts prisma/seed.ts
git commit -m "Seed unique demo editorial copy for every product."
```

---

### Task 4: Product page + CTA labels

**Files:**
- Create: `src/components/public/ProductReview.tsx`
- Modify: `src/app/p/[slug]/page.tsx`
- Modify: `src/components/public/BuyButtons.tsx`
- Modify: `src/components/public/ProductCard.tsx` (if it says “Buy on”)
- Create: `src/lib/json-ld.ts` (Product + Breadcrumb builders used here)

**Interfaces:**
- Consumes: parseSpecs, formatUpdated, ctaLabel, DISCLOSURE_COPY, parseStringList, resolveStore
- Produces: `productJsonLd(...)`, `breadcrumbJsonLd(...)`

CTA in BuyButtons:

```tsx
{ctaLabel(resolved.label, resolved.id)}
```

Product page section order as in the spec. Canonical: `${siteUrl()}/p/${slug}` (no `src` query). Remove `availability: InStock` and brand CuratedPicks from JSON-LD. Include `offers.price` only if `priceInr > 0`. Brand only if `product.brand` is set.

- [ ] **Step 1: Implement ProductReview + page metadata/canonical/JSON-LD + BuyButtons labels**
- [ ] **Step 2: Verify locally**

Run: start `pnpm dev --port 3001` if 3000 is taken. Curl `/p/airwave-pro-headphones` and assert HTML contains `Quick verdict`, `Who should skip`, `SAMPLE` must NOT appear publicly, `View on`, `Prices and availability can change`, and JSON-LD must not contain `InStock` or `aggregateRating`.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ProductReview.tsx src/app/p/[slug]/page.tsx src/components/public/BuyButtons.tsx src/components/public/ProductCard.tsx src/lib/json-ld.ts
git commit -m "Rebuild product pages as review-style editorial layouts."
```

---

### Task 5: Admin form + saveProduct

**Files:**
- Modify: `src/components/admin/ProductForm.tsx`
- Modify: `src/app/actions/admin.ts`

**Interfaces:**
- Persist: brand, quickVerdict, whyFeatured, highlights (textarea → toJsonList), bestFor, notFor, finalVerdict, editorialNotes
- `lastPriceCheckedAt`: `new Date()` only if `priceInr` or `compareAtInr` changed vs `existing`; else keep `existing.lastPriceCheckedAt`

Revalidate `/`, `/links`, `/p/${slug}`, category path, `/sitemap.xml`.

- [ ] **Step 1: Extend Product type and form fields (one-per-line textareas)**
- [ ] **Step 2: Persist in saveProduct**
- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ProductForm.tsx src/app/actions/admin.ts
git commit -m "Let admin edit editorial product fields."
```

---

### Task 6: About, How we review, legal, contact

**Files:**
- Modify: `src/app/about/page.tsx`
- Create: `src/app/how-we-review/page.tsx`
- Modify: `src/lib/legalPages.ts` — remove “only place” / “do not repeat commission language”; mention on-page disclosure
- Modify: `src/app/legal/[slug]/page.tsx` — use `splitLegalBlocks`
- Modify: `next.config.ts` — redirects
- Modify: `src/app/contact/page.tsx` — omit WhatsApp card when empty
- Modify: `src/lib/settings.ts` — disclosure default = DISCLOSURE_COPY; `instagramUrl` default `""`

`next.config.ts` redirects:

```ts
async redirects() {
  return [
    { source: "/privacy", destination: "/legal/privacy", permanent: true },
    { source: "/terms", destination: "/legal/terms", permanent: true },
    { source: "/cookies", destination: "/legal/cookies", permanent: true },
    { source: "/affiliate-disclosure", destination: "/legal/affiliate", permanent: true },
  ];
},
```

- [ ] **Step 1: Write About and How we review (no founder story, no personal testing claim)**
- [ ] **Step 2: Fix legal copy + renderer + redirects + contact + settings default**
- [ ] **Step 3: Re-seed legal pages** (`pnpm db:seed`) so DB body updates
- [ ] **Step 4: Commit**

```bash
git add src/app/about/page.tsx src/app/how-we-review/page.tsx src/lib/legalPages.ts src/app/legal/[slug]/page.tsx next.config.ts src/app/contact/page.tsx src/lib/settings.ts
git commit -m "Add trust pages and fix legal disclosure rendering."
```

---

### Task 7: SEO, 404, homepage band, nav, /go guard

**Files:**
- Modify: `src/app/sitemap.ts` — add `/how-we-review`, four legal URLs, published posts
- Modify: `src/app/layout.tsx` — WebSite + Organization JSON-LD; sameAs only from `realSocialUrl`
- Create: `src/app/not-found.tsx`
- Modify: `src/app/page.tsx` — How we choose band after Popular
- Modify: `src/components/public/Header.tsx` — Instagram button only if `realSocialUrl`
- Modify: `src/components/public/Footer.tsx` — How we review link; DISCLOSURE_COPY; CuratedPicks/we voice
- Modify: `src/app/c/[slug]/page.tsx` — canonical + description + ItemList JSON-LD
- Modify: `src/app/go/[productId]/[merchant]/route.ts` — `if (!isHttpUrl(target))` redirect home
- Modify: `src/app/links/page.tsx` — canonical
- Modify: `src/app/blog/[slug]/page.tsx` and `src/app/blog/page.tsx` — canonical

- [ ] **Step 1: Implement SEO + 404 + nav + homepage band + http(s) guard**
- [ ] **Step 2: Verify**

```bash
curl -sS http://127.0.0.1:3001/how-we-review | grep -i "Product discovery"
curl -sSI http://127.0.0.1:3001/privacy | grep -i location
curl -sS http://127.0.0.1:3001/sitemap.xml | grep how-we-review
curl -sS http://127.0.0.1:3001/p/airwave-pro-headphones | grep -c InStock   # expect 0
curl -sS http://127.0.0.1:3001/this-page-does-not-exist-xyz -o /dev/null -w "%{http_code}"  # 404
pnpm exec tsc --noEmit
pnpm lint
node --experimental-strip-types --test src/lib/*.test.ts
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts src/app/layout.tsx src/app/not-found.tsx src/app/page.tsx src/components/public/Header.tsx src/components/public/Footer.tsx src/app/c/[slug]/page.tsx src/app/go/[productId]/[merchant]/route.ts src/app/links/page.tsx src/app/blog src/lib/json-ld.ts
git commit -m "Add technical SEO, 404, and affiliate redirect guard."
```

---

## Spec coverage check

| Spec section | Task |
|---|---|
| Data model columns | 2 |
| Demo editorial copy, prices unchanged | 3 |
| Product page order, empty omit, CTA, disclosure | 4 |
| JSON-LD honesty | 4, 7 |
| Admin fields + lastPriceCheckedAt rule | 5 |
| About, /how-we-review | 6 |
| Legal parser, copy, /privacy redirects | 6 |
| Contact WhatsApp placeholder | 6 |
| Sitemap, canonical, 404, homepage band, social empty, /go http(s) | 7 |
| Out of scope items | not scheduled |
