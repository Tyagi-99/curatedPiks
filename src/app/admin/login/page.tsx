import { loginAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="grid min-h-screen place-items-center bg-bg px-4">
      <form action={loginAction} className="relative w-full max-w-sm space-y-4 rounded-2xl border border-line bg-surface p-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <h1 className="font-display text-3xl">Sign in</h1>
        <p className="text-sm text-muted">DealDuniya editorial CMS</p>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error === "throttled"
              ? "Too many attempts. Wait a few minutes and try again."
              : "Wrong email or password."}
          </p>
        ) : null}
        <label className="block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-xl border border-line px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="w-full rounded-full bg-cta py-2.5 font-semibold text-cta-ink">
          Sign in
        </button>
      </form>
    </div>
  );
}
