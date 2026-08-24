import { useId, type InputHTMLAttributes } from "react";

// Champ de formulaire générique (label + erreur), utilisé par les formulaires
// publics et Seuil. `id` retombe sur `name` puis sur un id généré via useId
// pour rester stable en SSR/hydratation.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm text-text-muted">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-md border border-border bg-surface px-3 py-2 text-text outline-none focus:border-accent ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
