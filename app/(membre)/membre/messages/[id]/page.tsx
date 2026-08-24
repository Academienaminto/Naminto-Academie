import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation } from "@/modules/messaging/service";
import { ReplyForm } from "@/components/forms/ReplyForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";
import { SeuilOnlineBadge } from "@/components/ui/SeuilOnlineBadge";
import { getDictionary } from "@/lib/i18n/locale";

// Fil d'une conversation entre le membre et le Seuil. L'auth (redirect si
// non connecté) est garantie par le layout parent (app/(membre)/layout.tsx) ;
// l'anti-IDOR (une conversation n'est visible que par son propriétaire) est
// appliqué côté service, voir modules/messaging/service.ts
// (PROMPT MASTER STACK TECHNIQUE §35 MESSAGERIE).
export default async function MembreConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const { t } = await getDictionary();

  let conversation;
  try {
    // canManageAll=false : même vue Seuil ou non, cette page ne montre
    // jamais que les conversations qui appartiennent réellement à
    // l'utilisateur (anti-IDOR appliqué dans le service, pas ici).
    // TODO: `user!.id` s'appuie uniquement sur la garantie du layout parent
    // (utilisateur connecté) sans re-vérification locale, contrairement aux
    // pages voisines (ex. membre/messages/page.tsx) qui gardent le motif
    // défensif `user ? ... : ...`. À harmoniser, ou documenter explicitement
    // si ce raccourci est le choix voulu.
    conversation = await getConversation(id, user!.id, false);
  } catch (err) {
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/membre/messages" className="text-sm text-text-muted hover:text-accent">
        {t.messagesPage.back}
      </Link>
      {/* Statut de présence du Seuil en direct (composant serveur async, pas de polling) */}
      <SeuilOnlineBadge
        onlineLabel={t.messagesPage.seuilOnline}
        offlineLabel={t.messagesPage.seuilOffline}
      />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-text">
          {t.messagesPage.title}
        </h1>
        {conversation.status === "FERMEE" ? (
          <StatusButton
            endpoint={`/api/v1/conversations/${conversation.id}/status`}
            status="OUVERTE"
            label={t.messagesPage.reopen}
            variant="tertiary"
          />
        ) : (
          <StatusButton
            endpoint={`/api/v1/conversations/${conversation.id}/status`}
            status="FERMEE"
            label={t.messagesPage.close}
            variant="tertiary"
          />
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {conversation.messages.map((message) => (
          <li
            key={message.id}
            className={`max-w-lg rounded-lg border border-border p-3 text-sm ${
              message.senderId === conversation.userId
                ? "self-end bg-primary"
                : "self-start bg-surface"
            }`}
          >
            {message.content}
          </li>
        ))}
      </ul>

      <ReplyForm
        conversationId={conversation.id}
        placeholder={t.messagesPage.replyPlaceholder}
        sendLabel={t.messagesPage.send}
        sendingLabel={t.messagesPage.sending}
      />
    </main>
  );
}
