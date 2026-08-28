"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitNewsletter, type NewsletterState } from "@/app/actions/public";

const initialState: NewsletterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 bg-text px-4 py-2 text-sm font-semibold text-bg disabled:opacity-60"
    >
      {pending ? "…" : "Join"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(submitNewsletter, initialState);

  if (state.ok) {
    return (
      <p role="status" className="mt-4 text-sm text-success">
        You&apos;re on the list. We&apos;ll only email new picks.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 max-w-sm" noValidate>
      <label htmlFor="newsletter-email" className="block text-sm text-muted">
        Get new picks by email
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "newsletter-error" : undefined}
          className="w-full min-w-0 border border-line bg-bg px-3 py-2 text-sm"
        />
        <SubmitButton />
      </div>
      {state.error ? (
        <p id="newsletter-error" role="alert" className="mt-1 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
