"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

const newsletterSchema = z.string().trim().toLowerCase().max(200).pipe(z.string().email());

export async function submitNewsletter(formData: FormData) {
  const parsed = newsletterSchema.safeParse(String(formData.get("email") ?? ""));
  if (!parsed.success) throw new Error("Enter a valid email");
  await prisma.subscriber.upsert({
    where: { email: parsed.data },
    update: {},
    create: { email: parsed.data, source: "site" },
  });
}
