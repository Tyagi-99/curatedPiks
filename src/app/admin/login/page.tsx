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
      <form action={loginAction} className="relative w-full max-w-sm space-y-4 rounded-2xl bg-surface p-8 shadow">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        <h1 className="font-serif text-3xl">Admin</h1>
        <p className="text-sm text-muted">Sign in to publish products and copy Instagram reply links.</p>
        {error ? <p className="text-sm text-danger">Wrong email or password.</p> : null}
        <label className="block text-sm">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          Password
          <input name="password" type="password" required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
        </label>
        <button type="submit" className="w-full rounded-full bg-gray-900 py-2.5 font-medium text-white">
          Sign in
        </button>
      </form>
    </div>
  );
}
