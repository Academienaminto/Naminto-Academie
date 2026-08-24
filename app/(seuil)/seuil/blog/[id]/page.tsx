import { notFound } from "next/navigation";
import Link from "next/link";
import { AppError } from "@/lib/errors";
import { getPost } from "@/modules/blog/service";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

const COMMENT_STATUS_LABELS: Record<string, string> = {
  PUBLIE: "Publié",
  MASQUE: "Masqué",
  SUPPRIME: "Supprimé",
};

export default async function SeuilBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let result;
  try {
    result = await getPost(id, true);
  } catch (err) {
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }
  const { post, comments } = result;

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <Link href="/seuil/blog" className="text-sm text-text-muted hover:text-accent">
        ← Blog
      </Link>
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text">{post.title}</h1>
        <p className="text-sm text-text-muted">{post.status}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-text">
          Commentaires ({comments.length})
        </h2>
        {comments.length === 0 && <p className="text-text-muted">Aucun commentaire.</p>}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-text">
                {comment.user.profile?.firstName ?? comment.user.email}
              </p>
              <span className="text-xs uppercase tracking-wide text-text-muted">
                {COMMENT_STATUS_LABELS[comment.status] ?? comment.status}
              </span>
            </div>
            <p className="text-text-muted">{comment.content}</p>
            <div className="flex items-center gap-2">
              {comment.status !== "PUBLIE" && (
                <StatusButton
                  endpoint={`/api/v1/comments/${comment.id}/moderate`}
                  status="PUBLIE"
                  label="Publier"
                />
              )}
              {comment.status !== "MASQUE" && (
                <StatusButton
                  endpoint={`/api/v1/comments/${comment.id}/moderate`}
                  status="MASQUE"
                  label="Masquer"
                  variant="tertiary"
                />
              )}
              {comment.status !== "SUPPRIME" && (
                <StatusButton
                  endpoint={`/api/v1/comments/${comment.id}/moderate`}
                  status="SUPPRIME"
                  label="Supprimer"
                  variant="danger"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
