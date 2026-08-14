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

For production, switch `DATABASE_URL` to Neon Postgres (same Prisma schema; change `provider = "sqlite"` to `"postgresql"`). Add `AUTH_SECRET` in Vercel env.

## Daily loop

1. `/admin/products/new` — photos, 3 pros, 2 cons, Amazon + Flipkart URLs
2. Publish + pin on `/links`
3. Copy Instagram reply and paste under the comment `link`
4. Next day: `/admin/analytics` — which source and retailer got taps
