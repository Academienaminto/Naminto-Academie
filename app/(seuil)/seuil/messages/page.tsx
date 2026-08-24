import Link from "next/link";
import { listAll } from "@/modules/messaging/service";

// Liste toutes les conversations, tous membres confondus (listAll() est
// réservé au Seuil — voir modules/messaging/service.ts).
export default async function SeuilMessagesPage() {
  const conversations = await listAll();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Messagerie
      </h1>

      <ul className="flex flex-col gap-3">
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <Link
              href={`/seuil/messages/${conversation.id}`}
              className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-text">
                  {conversation.user.profile?.firstName ??
                    conversation.user.email}
                </p>
                <p className="text-sm text-text-muted">
                  {conversation.messages[0]?.content ?? "—"}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-text-muted">
                {conversation.status}
              </span>
            </Link>
          </li>
        ))}
        {conversations.length === 0 && (
          <p className="text-text-muted">Aucune conversation.</p>
        )}
      </ul>
    </main>
  );
}
