import { isSeuilOnline } from "@/modules/auth/service";

export async function SeuilOnlineBadge({
  onlineLabel,
  offlineLabel,
}: {
  onlineLabel: string;
  offlineLabel: string;
}) {
  const online = await isSeuilOnline();

  return (
    <span className="inline-flex items-center gap-2 text-xs text-text-muted">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${online ? "bg-success" : "bg-text-muted"}`}
      />
      {online ? onlineLabel : offlineLabel}
    </span>
  );
}
