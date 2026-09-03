export function SearchForm({
  id = "site-search",
  size = "header",
  defaultValue = "",
}: {
  id?: string;
  size?: "header" | "hero";
  defaultValue?: string;
}) {
  const hero = size === "hero";
  return (
    <form action="/links" method="get" role="search" className={hero ? "w-full max-w-xl" : "w-full max-w-xs"}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="What are you looking for?"
        autoComplete="off"
        className={
          hero
            ? "w-full rounded-full border border-line bg-surface px-5 py-3.5 text-base outline-none focus:border-text"
            : "w-full rounded-full border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-text"
        }
      />
    </form>
  );
}
