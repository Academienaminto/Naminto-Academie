// RÈGLES MÉTIER §57 : l'e-mail est un canal de contact à part entière,
// distinct des e-mails transactionnels (Resend, non branché ici). N'affiche
// rien si aucune adresse n'est configurée.
export function EmailButton({
  subject,
  label = "Nous écrire",
  className = "",
}: {
  subject?: string;
  label?: string;
  className?: string;
}) {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (!email) {
    return null;
  }

  const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

  return (
    <a
      href={url}
      className={`inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface ${className}`}
    >
      {label}
    </a>
  );
}
