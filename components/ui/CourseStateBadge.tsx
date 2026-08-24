import type { CourseAccessState } from "@/modules/progress/service";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Badge purement présentationnel : affiche l'état d'accès à un cours
// (verrouillé / achat requis / accessible / clos pour délai) déjà calculé
// par modules/progress/service. Les libellés viennent du dictionnaire i18n.

const CLASSES: Record<CourseAccessState, string> = {
  LOCKED: "text-text-muted",
  PURCHASE_REQUIRED: "text-warning",
  ACCESSIBLE: "text-success",
  CLOSED_FOR_DELAY: "text-error",
};

export function CourseStateBadge({
  state,
  t,
}: {
  state: CourseAccessState;
  t: Dictionary["courseState"];
}) {
  const labels: Record<CourseAccessState, string> = {
    LOCKED: t.locked,
    PURCHASE_REQUIRED: t.purchaseRequired,
    ACCESSIBLE: t.accessible,
    CLOSED_FOR_DELAY: t.closedForDelay,
  };
  return (
    <span className={`text-xs uppercase tracking-wide ${CLASSES[state]}`}>
      {labels[state]}
    </span>
  );
}
