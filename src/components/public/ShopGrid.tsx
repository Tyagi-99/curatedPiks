"use client";

import { useMemo, useState } from "react";
import { ProductCard, type ProductCardProduct } from "@/components/public/ProductCard";
import { CATEGORY_FILTERS, STORE_FILTERS } from "@/lib/stores";

const PAGE_SIZE = 8;

export function ShopGrid({
  products,
  source = "home",
}: {
  products: ProductCardProduct[];
  source?: string;
}) {
  const [query, setQuery] = useState("");
  const [store, setStore] = useState("all");
  const [category, setCategory] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => {
      const storeId = product.store || (product.amazonUrl ? "amazon" : product.flipkartUrl ? "flipkart" : "custom");
      if (store !== "all" && storeId !== store) return false;
      if (category !== "all" && product.category?.slug !== category) return false;
      if (!needle) return true;
      return `${product.title} ${product.shortDescription} ${product.description ?? ""}`.toLowerCase().includes(needle);
    });
  }, [products, query, store, category]);

  const shown = filtered.slice(0, visible);

  return (
    <div>
      <div className="sticky top-[57px] z-30 -mx-4 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:rounded-3xl sm:border">
        <label className="sr-only" htmlFor="shop-search">
          Search products
        </label>
        <input
          id="shop-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search products from the videos"
          className="w-full rounded-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-text"
        />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterPill
            active={store === "all" && category === "all"}
            onClick={() => {
              setStore("all");
              setCategory("all");
              setVisible(PAGE_SIZE);
            }}
          >
            All
          </FilterPill>
          {STORE_FILTERS.map((item) => (
            <FilterPill
              key={item.id}
              active={store === item.id}
              onClick={() => {
                setStore(item.id);
                setVisible(PAGE_SIZE);
              }}
            >
              {item.label}
            </FilterPill>
          ))}
          {CATEGORY_FILTERS.map((item) => (
            <FilterPill
              key={item.slug}
              active={category === item.slug}
              onClick={() => {
                setCategory(item.slug);
                setVisible(PAGE_SIZE);
              }}
            >
              {item.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {filtered.length} product{filtered.length === 1 ? "" : "s"} available
      </p>
      {filtered.length === 0 ? (
        <p className="mt-6 text-muted">Nothing matches that filter yet.</p>
      ) : (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((product) => (
            <ProductCard key={product.id} product={product} source={source} />
          ))}
        </div>
      )}
      {visible < filtered.length ? (
        <button
          type="button"
          onClick={() => setVisible((count) => count + PAGE_SIZE)}
          className="mx-auto mt-8 block rounded-full border border-line px-5 py-3 text-sm"
        >
          Load more
        </button>
      ) : filtered.length > 0 ? (
        <p className="mt-8 text-center text-sm text-faint">You&apos;ve reached the end</p>
      ) : null}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
        active ? "bg-text text-bg" : "border border-line bg-surface text-muted"
      }`}
    >
      {children}
    </button>
  );
}
