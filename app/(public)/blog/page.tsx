import Link from "next/link";
import { listPublished } from "@/modules/blog/service";
import { getDictionary } from "@/lib/i18n/locale";
import { localize, localizeOptional } from "@/lib/i18n/content";

// Pas de `revalidate` : voir la note dans app/(public)/cursus/page.tsx —
// un cache ISR ici figerait aussi le header dépendant de la session.

export default async function BlogPage() {
  const posts = await listPublished();
  const { t, locale } = await getDictionary();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <h1 className="font-heading text-3xl font-semibold text-text">
        {t.nav.blog}
      </h1>

      {posts.length === 0 && (
        <p className="text-text-muted">{t.blogPage.empty}</p>
      )}

      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li
            key={post.id}
            className="rounded-lg border border-border bg-surface p-6"
          >
            <Link href={`/blog/${post.id}`} className="hover:underline">
              <h2 className="font-heading text-xl font-semibold text-text">
                {localize(locale, post.title, post.titleEn)}
              </h2>
            </Link>
            {post.excerpt && (
              <p className="mt-2 text-text-muted">
                {localizeOptional(locale, post.excerpt, post.excerptEn)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
