"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/actions/public";

const initialState: ContactState = {};

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <span id={id} className="mt-1 block text-sm font-normal text-danger">
      {message}
    </span>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent px-5 py-2.5 font-medium text-white hover:bg-accent-hover disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);
  const errors = state.errors ?? {};
  const values = state.values;

  return (
    <form action={formAction} className="mt-10 space-y-4" noValidate>
      {errors.form ? (
        <p role="alert" className="text-sm text-danger">
          {errors.form}
        </p>
      ) : null}
      <label className="block text-sm font-medium">
        Name
        <input
          name="name"
          required
          defaultValue={values?.name}
          maxLength={120}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className="mt-1 w-full border border-line px-3 py-2"
        />
        <FieldError id="contact-name-error" message={errors.name} />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          defaultValue={values?.email}
          maxLength={200}
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className="mt-1 w-full border border-line px-3 py-2"
        />
        <FieldError id="contact-email-error" message={errors.email} />
      </label>
      <label className="block text-sm font-medium">
        Subject
        <select
          name="subject"
          defaultValue={values?.subject ?? "general"}
          className="mt-1 w-full border border-line px-3 py-2"
        >
          <option value="general">General</option>
          <option value="review">Suggest a product</option>
          <option value="partnership">Partnership</option>
          <option value="bug">Broken link</option>
        </select>
      </label>
      <label className="block text-sm font-medium">
        Message
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={5000}
          rows={5}
          defaultValue={values?.body}
          aria-invalid={errors.body ? true : undefined}
          aria-describedby={errors.body ? "contact-body-error" : undefined}
          className="mt-1 w-full border border-line px-3 py-2"
        />
        <FieldError id="contact-body-error" message={errors.body} />
      </label>
      <SubmitButton />
    </form>
  );
}
