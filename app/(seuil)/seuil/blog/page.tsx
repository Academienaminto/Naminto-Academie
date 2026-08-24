import { listAllPosts } from "@/modules/blog/service";
import { CreatePostForm } from "@/components/forms/seuil/CreatePostForm";
import { StatusButton } from "@/components/forms/seuil/StatusButton";

export default async function SeuilBlogPage() {
  const posts = await listAllPosts();

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="font-heading text-2xl font-semibold text-text">Blog</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-4"
            >
              <div>
                <p className="text-text">{post.title}</p>
                <p className="text-xs uppercase tracking-wide text-text-muted">
                  {post.status}
                </p>
              </div>
              {post.status === "PUBLIE" ? (
                <StatusButton
                  endpoint={`/api/v1/blog/posts/${post.id}/status`}
                  status="RETIRE"
                  label="Retirer"
                  variant="tertiary"
                />
              ) : (
                <StatusButton
                  endpoint={`/api/v1/blog/posts/${post.id}/status`}
                  status="PUBLIE"
                  label="Publier"
                />
              )}
            </li>
          ))}
          {posts.length === 0 && (
            <p className="text-text-muted">Aucun article créé.</p>
          )}
        </ul>
        <CreatePostForm />
      </div>
    </main>
  );
}
