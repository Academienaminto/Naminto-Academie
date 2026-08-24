import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listMine } from "@/modules/messaging/service";
import { getDictionary } from "@/lib/i18n/locale";

export default async function MembreMessagesPage() {
  const user = await getCurrentUser();
  const conversations = user ? await listMine(user.id) : [];
  const { t } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/membre" className="text-sm text-text-muted hover:text-accent">
        {t.messagesPage.back}
      </Link>
      <h1 className="font-heading text-2xl font-semibold text-text">
        {t.messagesPage.title}
      </h1>

      <ul className="flex flex-col gap-3">
        {conversations.map((conversation) => {
          const last = conversation.messages[0];
          return (
            <li key={conversation.id}>
              <Link
                href={`/membre/messages/${conversation.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border bg-surface p-4 hover:border-accent sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-text-muted">{last?.content ?? "—"}</p>
                <span className="text-xs uppercase tracking-wide text-text-muted">
                  {conversation.status}
                </span>
              </Link>
            </li>
          );
        })}
        {conversations.length === 0 && (
          <p className="text-text-muted">{t.messagesPage.empty}</p>
        )}
      </ul>
    </main>
  );
}
