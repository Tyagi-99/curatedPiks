"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { contactSpamReason, isHoneypotTriggered } from "@/lib/contactGuard";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { clientIp } from "@/lib/requestIp";

export type ContactState = {
  errors?: Partial<Record<"name" | "email" | "subject" | "body" | "form", string>>;
  // React clears uncontrolled fields once an action settles, so the submitted
  // values come back with the errors and are re-applied as defaults.
  values?: { name: string; email: string; subject: string; body: string };
};

const SUBJECTS = ["general", "review", "partnership", "bug"] as const;

// Caps exist so a single POST cannot write an unbounded row: the form used to
// accept and store a 100,000 character body.
const contactSchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120, "Keep the name under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "We need an email to reply to.")
    .max(200, "Keep the email under 200 characters.")
    .pipe(z.string().email("Enter a valid email address.")),
  subject: z.enum(SUBJECTS).catch("general"),
  body: z
    .string()
    .trim()
    .min(10, "Please add at least 10 characters so we know what you need.")
    .max(5000, "Keep the message under 5000 characters."),
});

export async function submitContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Hidden field: humans leave it empty. Bots that fill every input are dropped
  // with a fake success so they do not retry.
  if (isHoneypotTriggered(String(formData.get("company") ?? ""))) {
    redirect("/contact/thanks");
  }

  // Five messages per 10 minutes per IP. The form previously accepted unlimited
  // submissions, so it was a free write endpoint for spam.
  const ip = await clientIp();
  const limited = rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
  if (!limited.ok) {
    return {
      errors: {
        form: `Too many messages just now. Please try again in about ${Math.ceil(
          limited.retryAfterSeconds / 60,
        )} minute(s).`,
      },
    };
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? "general"),
    body: String(formData.get("body") ?? ""),
  };
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "email" || field === "subject" || field === "body") {
        errors[field] ??= issue.message;
      }
    }
    return { errors, values };
  }

  const emailKey = parsed.data.email.toLowerCase();
  if (!rateLimit(`contact-email:${emailKey}`, 3, 10 * 60 * 1000).ok) {
    return {
      errors: { form: "Too many messages from this email just now. Please try again later." },
      values,
    };
  }

  if (contactSpamReason(parsed.data)) {
    return {
      errors: { form: "Please send a plain-text message without HTML or shortened links." },
      values,
    };
  }

  try {
    await prisma.message.create({ data: parsed.data });
  } catch (error) {
    // Previously this bubbled up as a bare HTTP 500 page.
    console.error("Failed to save contact message", error);
    return {
      errors: { form: "We could not send that just now. Please try again in a moment." },
      values,
    };
  }

  redirect("/contact/thanks");
}

export type NewsletterState = { error?: string; ok?: boolean };

const newsletterSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email.")
  .max(200, "That email is too long.")
  .pipe(z.string().email("Enter a valid email address."));

export async function submitNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const ip = await clientIp();
  if (!rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000).ok) {
    return { error: "Too many attempts. Please try again shortly." };
  }

  const parsed = newsletterSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
  }

  try {
    // upsert so a repeat signup is a silent success rather than a unique-key error.
    await prisma.subscriber.upsert({
      where: { email: parsed.data },
      update: {},
      create: { email: parsed.data, source: "site" },
    });
  } catch (error) {
    console.error("Failed to save subscriber", error);
    return { error: "We could not save that just now. Please try again." };
  }

  return { ok: true };
}
