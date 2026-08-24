// RÈGLES MÉTIER §57 : WhatsApp est un canal de contact externe distinct de
// la messagerie interne — simple lien wa.me, pas d'API Business (pas
// d'automatisation ni de webhook nécessaires pour un bouton de contact).
// N'affiche rien si le numéro n'est pas configuré (STACK TECHNIQUE §74 :
// dépendance externe absente → dégradation propre, jamais un lien cassé).
export function WhatsAppButton({
  message,
  label = "Nous contacter sur WhatsApp",
  className = "",
}: {
  message?: string;
  label?: string;
  className?: string;
}) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) {
    return null;
  }

  const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition hover:bg-surface ${className}`}
    >
      {label}
    </a>
  );
}
