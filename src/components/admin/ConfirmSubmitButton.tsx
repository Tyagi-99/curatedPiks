"use client";

/**
 * Destructive admin actions used to fire on a single click, and deleting a
 * product also cascades away its click history. This adds a confirmation step
 * without changing the button's appearance.
 */
export function ConfirmSubmitButton({
  formAction,
  name,
  value,
  message,
  className,
  children,
}: {
  formAction: (formData: FormData) => void | Promise<void>;
  name: string;
  value: string;
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      formAction={formAction}
      name={name}
      value={value}
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
