"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "general").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!name || !email || body.length < 10) {
    throw new Error("Please fill in the form.");
  }
  await prisma.message.create({ data: { name, email, subject, body } });
  redirect("/contact/thanks");
}

export async function submitNewsletter(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) throw new Error("Enter a valid email");
  await prisma.subscriber.upsert({
    where: { email },
    update: {},
    create: { email, source: "site" },
  });
}
