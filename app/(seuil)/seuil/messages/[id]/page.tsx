import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation } from "@/modules/messaging/service";
import { ReplyForm } from "@/components/forms/ReplyForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

// Fiche d'une conversation + réponse. canManageAll=true dans getConversation
// (modules/messaging/service.ts) : le Seuil peut ouvrir n'importe quelle
// conversation, alors qu'un membre ne peut voir que les siennes (garde
// anti-IDOR appliquée côté service, pas dans la route).
export default async function SeuilConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  let conversation;
  try {
    conversation = await getConversation(id, user!.id, true);
  } catch (err) {
    // AppError RESOURCE_NOT_FOUND -> 404 Next.js.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-text">
          Conversation
        </h1>
        {conversation.status === "FERMEE" ? (
          <StatusButton
            endpoint={`/api/v1/conversations/${conversation.id}/status`}
            status="OUVERTE"
            label="Rouvrir"
            variant="tertiary"
          />
        ) : (
          <StatusButton
            endpoint={`/api/v1/conversations/${conversation.id}/status`}
            status="FERMEE"
            label="Fermer la conversation"
            variant="secondary"
          />
        )}
      </div>

      <ul className="flex flex-col gap-3">
        {conversation.messages.map((message) => (
          <li
            key={message.id}
            className={`max-w-lg rounded-lg border border-border p-3 text-sm ${
              message.senderId === conversation.userId
                ? "self-start bg-surface"
                : "self-end bg-primary"
            }`}
          >
            {message.content}
          </li>
        ))}
      </ul>

      <ReplyForm conversationId={conversation.id} />
    </main>
  );
}
