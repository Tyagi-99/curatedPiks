"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword, type PasswordState } from "@/app/actions/admin";

const initialState: PasswordState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gray-900 px-5 py-2 text-white disabled:opacity-60"
    >
      {pending ? "Saving…" : "Change password"}
    </button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePassword, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-3 rounded-2xl border border-line p-4">
      <h2 className="font-medium">Change password</h2>
      <p className="text-sm text-muted">
        Signs out any other browser still holding a session cookie.
      </p>
      {state.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p role="status" className="text-sm text-success">
          Password changed.
        </p>
      ) : null}
      <label className="block text-sm">
        Current password
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        New password (12 characters or more)
        <input
          name="newPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={12}
          autoComplete="new-password"
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <SubmitButton />
    </form>
  );
}
