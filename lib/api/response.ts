import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { getLocale } from "@/lib/i18n/locale";
import { errorMessages } from "@/lib/i18n/dictionaries";

// Format de réponse standard — voir API ET SERVICES NAMINTO ACADÉMIE.
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * Résout le message d'erreur dans la langue de la requête courante.
 * `error.messageKey` n'existe que pour les erreurs atteignables depuis une
 * surface publique/membre (voir lib/errors.ts) ; pour toutes les autres
 * (essentiellement l'espace Seuil), `error.message` (français) reste la
 * seule source — comportement identique à avant l'i18n des erreurs.
 */
async function resolveMessage(error: AppError): Promise<string> {
  if (!error.messageKey) return error.message;
  const locale = await getLocale();
  return errorMessages[locale]?.[error.messageKey] ?? error.message;
}

export async function fail(error: AppError) {
  const message = await resolveMessage(error);
  return NextResponse.json(
    { success: false, error: { code: error.code, message } },
    { status: error.status },
  );
}

/**
 * Enrobe un handler de route pour transformer AppError et ZodError en
 * réponses JSON cohérentes, sans jamais laisser fuiter une stack trace.
 * Le second paramètre (context) est transmis tel quel : il porte `params`
 * pour les routes dynamiques (`app/api/v1/.../[id]/route.ts`).
 */
export function handleRoute<Context = unknown>(
  fn: (req: Request, context: Context) => Promise<NextResponse>,
): (req: Request, context: Context) => Promise<NextResponse> {
  return async (req: Request, context: Context) => {
    try {
      return await fn(req, context);
    } catch (err) {
      if (err instanceof AppError) {
        return await fail(err);
      }
      if (err instanceof ZodError) {
        return await fail(
          new AppError(
            "VALIDATION_ERROR",
            "Les données envoyées sont invalides.",
            err.flatten(),
          ),
        );
      }
      console.error("[unhandled-route-error]", err);
      return await fail(
        new AppError("INTERNAL_ERROR", "Une erreur interne est survenue."),
      );
    }
  };
}
