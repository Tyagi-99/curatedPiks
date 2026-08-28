/**
 * Loading skeleton for the admin area only.
 *
 * This deliberately does NOT live at the app root. A root-level loading.tsx
 * streams the shell — and therefore commits HTTP 200 — before the page body
 * runs, so every `notFound()` came back as a soft 404 with status 200 instead
 * of a real 404. Admin routes are dynamic and never 404, so it is safe here.
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-48 rounded bg-line" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-14 w-full rounded-xl bg-line" />
        ))}
      </div>
    </div>
  );
}
