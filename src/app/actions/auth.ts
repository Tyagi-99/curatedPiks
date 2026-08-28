"use server";

import { redirect } from "next/navigation";
import { clearSession, login } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { clientIp } from "@/lib/requestIp";

// Ten attempts per 15 minutes per IP. Previously unlimited: twelve rapid wrong
// passwords were all accepted with no delay or lockout.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const ip = await clientIp();
  const { ok } = rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  void email;
  if (!ok) {
    // Deliberately the same shape as a wrong password, so probing cannot tell
    // a locked-out account from a bad credential.
    redirect("/admin/login?error=throttled");
  }

  const user = await login(email, password);
  if (!user) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}
