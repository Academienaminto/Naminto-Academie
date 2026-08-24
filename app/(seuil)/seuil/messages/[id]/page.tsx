import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getCurrentUser } from "@/lib/auth/session";
import { getConversation } from "@/modules/messaging/service";
import { ReplyForm } from "@/components/forms/seuil/ReplyForm";

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
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">
        Conversation
      </h1>

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
