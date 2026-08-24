import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-accent/40 bg-[#f2ede0]">
        <Image
          src="/images/logo-mark.png"
          alt=""
          fill
          sizes="36px"
          className="object-cover"
        />
      </span>
      <span className="font-heading text-sm uppercase tracking-[0.3em] text-accent">
        Naminto Académie
      </span>
    </span>
  );
}
