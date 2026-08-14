interface FieldErrorProps {
  message?: string;
}

/** Inline error text shown under a form field. */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

interface FormErrorProps {
  message?: string | null;
}

/** Banner shown for top-level form errors (API errors). */
export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="animate-fade-in rounded-lg border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
    >
      {message}
    </div>
  );
}