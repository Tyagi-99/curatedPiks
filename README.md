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

Admin login (change after first login):

- Email: `admin@curatedpicks.local`
- Password: `ChangeMe123!`

## Hosting

Hostinger Business hosts the **domain + email only**. Deploy this app on **Vercel**. Point the Hostinger DNS A/CNAME at Vercel.

`DATABASE_URL` should be a Neon Postgres URI (the Prisma schema already targets `postgresql`).

Required env vars in production — the build fails fast if any are missing:

| Variable | Why |
| --- | --- |
| `DATABASE_URL` | Neon Postgres, `sslmode=require` |
| `AUTH_SECRET` | Signs session cookies. 32+ random chars (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, and JSON-LD are built from this |
| `ADMIN_PASSWORD` | Password for the first admin. Only used when the account does not exist yet |

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
