# CuratedPicks blog dashboard and public blog

Date: 2026-08-15
Status: approved in conversation
Source: `/home/tyagi/Downloads/CuratedPicks`

## Locked decisions

- Markdown + small toolbar (not TipTap, not a packaged MD editor)
- Slice: admin editor + public `/blog` + SEO. No tags/categories/author bios
- Reuse `/api/admin/upload` and `ImageField`
- Deploy to Vercel after implementation
- Hybrid site voice: public blog is CuratedPicks “we”

## Data

Keep `Post` title, slug, excerpt, body (markdown), status, authorId, timestamps.

Add: `coverImageUrl`, `metaTitle`, `metaDescription`, `publishedAt` (set once on first publish).

OG image = cover. Empty meta falls back to title/excerpt. Drafts not in sitemap.

## Admin

List: title, status, publishedAt or Draft, updated, view link, delete (admin).

Editor: title, slug, excerpt, cover ImageField (16:9 / 1600×900, JPG/WebP, 5 MB), SEO fields, toolbar (H2, bold, link, image upload → insert markdown), preview, publish checkbox (admin), save.

## Public

`/blog` index with cover, title, excerpt, date. `/blog/[slug]` renders sanitized markdown (headings, bold/italic, lists, links, images). External links `noopener noreferrer`. Logged-in staff can preview drafts with a Draft banner.

Header gets a quiet Blog link. Footer Browse gets Blog.

## SEO

Canonical, unique title/description, OG/Twitter from cover, Article + Breadcrumb JSON-LD. Author/publisher = Organization CuratedPicks. No ratings.

## Out of scope

WYSIWYG, tags, related posts, comments, AdSense in posts, inventing authors.
