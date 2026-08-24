import Link from "next/link";
import { notFound } from "next/navigation";
import { AppError } from "@/lib/errors";
import { getPost } from "@/modules/blog/service";
import { CommentForm } from "@/components/forms/CommentForm";
import { getDictionary } from "@/lib/i18n/locale";
import { localize } from "@/lib/i18n/content";

// Détail d'un article de blog publié — composant serveur.
// Pas de `revalidate` : voir la note dans app/(public)/cursus/page.tsx.

export default async function BlogPostPage({
  params,
}: {
  // `params` est une Promise (App Router récent) : il faut l'attendre avant
  // d'en lire les segments dynamiques.
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let result;
  try {
    result = await getPost(id, false);
  } catch (err) {
    // getPost lève une AppError RESOURCE_NOT_FOUND pour un id inexistant ou
    // un article non publié : on la traduit en 404 Next.js plutôt que de
    // laisser remonter une erreur générique. Même schéma dans
    // app/(public)/formations/[id]/page.tsx.
    if (err instanceof AppError && err.code === "RESOURCE_NOT_FOUND") {
      notFound();
    }
    throw err;
  }

  const { post, comments } = result;
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <Link href="/blog" className="text-sm text-text-muted hover:text-accent">
        {t.blogPost.back}
      </Link>

      <article>
        <h1 className="font-heading text-3xl font-semibold text-text">
          {localize(locale, post.title, post.titleEn)}
        </h1>
        <div className="mt-6 whitespace-pre-wrap text-text">
          {localize(locale, post.content, post.contentEn)}
        </div>
      </article>

      <section className="flex flex-col gap-4 border-t border-border pt-6">
        <p className="text-xs uppercase tracking-wide text-text-muted">
          {t.blogPost.comments} ({comments.length})
        </p>
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-border bg-surface p-4 text-sm text-text"
            >
              {comment.content}
            </li>
          ))}
        </ul>
        <CommentForm postId={post.id} t={t.blogPost} />
      </section>
    </main>
  );
}
