import Image from "next/image";
import { getDictionary } from "@/lib/i18n/locale";

export default async function UniversPage() {
  const { t } = await getDictionary();
  const { universPage: p } = t;

  return (
    <main className="flex flex-1 flex-col">
      <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden">
        <Image
          src="/images/hero-3.png"
          alt="Naminto Académie"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 px-6 pb-10 text-center">
          <h1 className="font-heading text-3xl font-semibold text-text sm:text-5xl">
            {p.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-16 px-6 py-16">
        <section className="whitespace-pre-wrap text-lg leading-relaxed text-text">
          {p.intro}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold text-accent">
            {p.missionTitle}
          </h2>
          <p className="whitespace-pre-wrap text-text-muted">{p.missionText}</p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold text-accent">
            {p.visionTitle}
          </h2>
          <p className="whitespace-pre-wrap text-text-muted">{p.visionText}</p>
        </section>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/hero-2.png"
            alt="Naminto Académie"
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold text-accent">
            {p.philosophyTitle}
          </h2>
          <p className="whitespace-pre-wrap text-text-muted">{p.philosophyText}</p>
        </section>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border">
          <Image
            src="/images/hero-4.png"
            alt="Naminto Académie"
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold text-accent">
            {p.corpsCelesteTitle}
          </h2>
          <p className="whitespace-pre-wrap text-text-muted">{p.corpsCelesteText}</p>
        </section>
      </div>
    </main>
  );
}
