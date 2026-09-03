# CuratedPicks

Social-first affiliate site: Instagram/Facebook comment `link` → product page → Amazon.in / Flipkart. AdSense is the fallback if they do not buy.

- Public site: `/` `/links` `/p/[slug]` `/c/[slug]` `/blog` `/legal/*`
- Tracked buy buttons: `/go/[productId]/amazon|flipkart|network`
- Admin: `/admin` (products, blog, clicks, inbox, settings)

## Local

```bash
cd curatedpicks
cp .env.example .env   # already present in this checkout
pnpm install
pnpm db:migrate        # first time: name the migration "init"
pnpm db:seed
pnpm dev
```

Admin login: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` **before** the first
`pnpm db:seed`. The seed only sets a password when it creates the account, so it
will never reset one you have already changed.

If `ADMIN_PASSWORD` is unset locally, the seed falls back to a well-known
development password and prints a warning. Never rely on that outside your
machine — in production the build refuses to run without `ADMIN_PASSWORD` set.

To change the password later, use **Admin → Settings → Change password**, or run
`pnpm admin:password`.

## Hosting

Hostinger Business hosts the **domain + email only**. Deploy this app on **Vercel**. Point the Hostinger DNS A/CNAME at Vercel.

`DATABASE_URL` should be a Neon Postgres URI (the Prisma schema already targets `postgresql`).

Required env vars in production — the build fails fast if any are missing:

| Variable | Why |
| --- | --- |
| `DATABASE_URL` | Neon Postgres, `sslmode=require` |
| `AUTH_SECRET` | Signs session cookies. 32+ random chars (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, and JSON-LD are built from this |
| `ADMIN_PASSWORD` | Optional after the first admin exists. Required only to create the first admin account |

The seed is **create-if-missing**: it never overwrites products, legal pages,
settings, or the admin password, because it runs on every deploy. To refresh the
demo content locally, run `SEED_OVERWRITE_DEMO=1 pnpm db:seed`.

### Known limitation: image uploads

Uploaded images are written to `UPLOAD_DIR` (default `/tmp/curatedpicks-uploads`)
and served via `/api/uploads/[filename]`. On Vercel that directory is per-instance
and ephemeral, so uploads do not survive a redeploy or a second instance. Either
paste hosted image URLs (works today) or move uploads to object storage such as
Vercel Blob or S3 before relying on the upload button in production.

## Daily loop

1. `/admin/products/new` — photos, 3 pros, 2 cons, Amazon + Flipkart URLs
2. Publish + pin on `/links`
3. Copy Instagram reply and paste under the comment `link`
4. Next day: `/admin/analytics` — which source and retailer got taps

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm demo:status` | Shows which seeded demo products are publicly visible |
| `pnpm demo:unpublish` | Hides all 18 demo products. Reversible. |
| `pnpm demo:publish` | Puts them back (local development) |
| `pnpm admin:password` | Rotates a password: `ADMIN_EMAIL=… NEW_PASSWORD='…' pnpm admin:password` |
| `pnpm test` | Unit tests |

## Before going public

The seed ships 18 example products with invented brand names, arbitrary prices,
and stock photography. Each is tagged `SAMPLE …` in `editorialNotes`. Publishing
invented reviews misrepresents the site and will fail Amazon Associates and
AdSense review, so:

1. `pnpm demo:unpublish`
2. Add real products through `/admin/products/new`
3. Put a real affiliate tag on every buy URL — the seeded links are plain search
   URLs with no `tag=`, so they earn nothing
4. Rotate the production admin password (`ChangeMe123!` is in this repo's git
   history and the repo is public)
5. Set the four required env vars in Vercel and run `prisma migrate deploy`
6. Verify the domain in Google Search Console and submit `/sitemap.xml`

Traffic is measured with Vercel Analytics, which is first-party and cookieless —
mounted on the public shell only, so admin activity is not tracked. This is why
the cookie notice can still say the site sets no analytics cookies.

Image uploads are not durable on Vercel (see *Known limitation* above). Paste
hosted image URLs until object storage is wired up.
