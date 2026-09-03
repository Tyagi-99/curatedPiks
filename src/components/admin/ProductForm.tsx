import { deleteProduct, saveProduct } from "@/app/actions/admin";
import { parseStringList } from "@/lib/json";
import { instagramReply, productShareUrl, SOCIAL_SOURCES } from "@/lib/site";
import { STORES } from "@/lib/stores";
import { ConfirmSubmitButton } from "./ConfirmSubmitButton";
import { CopyButtons } from "./CopyButtons";
import { ImageField } from "./ImageField";

type Category = { id: string; name: string };
type Product = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  priceInr: number;
  compareAtInr: number | null;
  imageUrl: string;
  ogImageUrl: string;
  prosJson: string;
  consJson: string;
  amazonUrl: string;
  flipkartUrl: string;
  networkUrl: string;
  store?: string;
  affiliateUrl?: string;
  featuresJson?: string;
  brand?: string;
  quickVerdict?: string;
  whyFeatured?: string;
  highlightsJson?: string;
  bestForJson?: string;
  notForJson?: string;
  finalVerdict?: string;
  editorialNotes?: string;
  published: boolean;
  pinnedToBio: boolean;
  popular?: boolean;
  sortOrder?: number;
  categoryId: string;
};

function specsText(raw?: string) {
  if (!raw) return "";
  try {
    const value = JSON.parse(raw) as Record<string, string>;
    return Object.entries(value)
      .map(([label, item]) => `${label}: ${item}`)
      .join("\n");
  } catch {
    return "";
  }
}

export function ProductForm({
  product,
  categories,
  canEditLinks,
}: {
  product?: Product;
  categories: Category[];
  canEditLinks: boolean;
}) {
  return (
    <form action={saveProduct} className="max-w-2xl space-y-4">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <label className="block text-sm font-medium">
        Title
        <input name="title" defaultValue={product?.title} required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Slug (URL)
        <input name="slug" defaultValue={product?.slug} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Category
        <select name="categoryId" defaultValue={product?.categoryId} className="mt-1 w-full rounded-xl border border-line px-3 py-2">
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Short pitch (2–4 sentences)
        <textarea name="shortDescription" rows={3} defaultValue={product?.shortDescription} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Extra notes
        <textarea name="description" rows={4} defaultValue={product?.description} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Brand
        <input name="brand" defaultValue={product?.brand} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Quick verdict
        <textarea name="quickVerdict" rows={2} defaultValue={product?.quickVerdict} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Why we featured it
        <textarea name="whyFeatured" rows={4} defaultValue={product?.whyFeatured} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Highlights (one per line)
        <textarea name="highlights" rows={4} defaultValue={product ? parseStringList(product.highlightsJson ?? "[]").join("\n") : ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Who should consider it (one per line)
        <textarea name="bestFor" rows={3} defaultValue={product ? parseStringList(product.bestForJson ?? "[]").join("\n") : ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Who should skip it (one per line)
        <textarea name="notFor" rows={3} defaultValue={product ? parseStringList(product.notForJson ?? "[]").join("\n") : ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Final verdict
        <textarea name="finalVerdict" rows={2} defaultValue={product?.finalVerdict} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Editorial notes (admin only)
        <textarea name="editorialNotes" rows={2} defaultValue={product?.editorialNotes} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Price ₹
          <input name="priceInr" type="number" step="0.01" defaultValue={product?.priceInr ?? 0} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm font-medium">
          Compare-at ₹
          <input name="compareAtInr" type="number" step="0.01" defaultValue={product?.compareAtInr ?? ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
      </div>
      <ImageField
        key={`image-${product?.id ?? "new"}`}
        name="imageUrl"
        label="Product image"
        defaultValue={product?.imageUrl}
        hint="Paste a direct https image URL, or upload a file. Best: 4:5 portrait (1200 × 1500 px). JPG or WebP, PNG also fine. Under 5 MB. Cards crop to 4:5, so avoid a wide landscape shot."
      />
      <ImageField
        key={`og-${product?.id ?? "new"}`}
        name="ogImageUrl"
        label="Share preview image (optional)"
        defaultValue={product?.ogImageUrl}
        hint="Used on WhatsApp / Instagram link previews. Best: 1.91:1 (1200 × 630 px), JPG or WebP, under 5 MB. Leave empty to reuse the product image."
      />
      <label className="block text-sm font-medium">
        Pros (one per line)
        <textarea name="pros" rows={4} defaultValue={product ? parseStringList(product.prosJson).join("\n") : ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Cons (one per line)
        <textarea name="cons" rows={3} defaultValue={product ? parseStringList(product.consJson).join("\n") : ""} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Specs (one per line, Label: value)
        <textarea name="specs" rows={4} defaultValue={specsText(product?.featuresJson)} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      {canEditLinks ? (
        <>
          <label className="block text-sm font-medium">
            Store
            <select name="store" defaultValue={product?.store || "amazon"} className="mt-1 w-full rounded-xl border border-line px-3 py-2">
              {STORES.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Affiliate URL
            <input name="affiliateUrl" defaultValue={product?.affiliateUrl || product?.amazonUrl || product?.flipkartUrl || product?.networkUrl} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          </label>
        </>
      ) : (
        <p className="text-sm text-muted">Only an admin can edit affiliate URLs.</p>
      )}
      <label className="block text-sm font-medium">
        Display order
        <input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      {canEditLinks ? (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" defaultChecked={product?.published} />
            Publish (live on the site)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pinnedToBio" defaultChecked={product?.pinnedToBio} />
            Featured product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="popular" defaultChecked={product?.popular} />
            Popular
          </label>
        </>
      ) : (
        <p className="text-sm text-muted">Only an admin can publish, feature, or mark a product popular.</p>
      )}
      <button type="submit" className="rounded-full bg-gray-900 px-5 py-2 text-white">
        Save
      </button>
      {product ? (
        <div className="rounded-2xl border border-line bg-surface p-4">
          <h3 className="font-medium">Copy for the comment reply</h3>
          <p className="mt-2 break-all text-sm">{instagramReply(product.slug)}</p>
          <CopyButtons
            items={SOCIAL_SOURCES.map((source) => ({
              label: source.label,
              value: source.id === "ig" ? instagramReply(product.slug) : productShareUrl(product.slug, source.id),
            }))}
          />
        </div>
      ) : null}
      {product && canEditLinks ? (
        <ConfirmSubmitButton
          formAction={deleteProduct}
          name="id"
          value={product.id}
          message={`Delete "${product.title}"? This also removes its click history and cannot be undone.`}
          className="text-sm text-danger"
        >
          Delete product
        </ConfirmSubmitButton>
      ) : null}
    </form>
  );
}
