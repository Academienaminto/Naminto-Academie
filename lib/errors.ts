// Contrat d'erreur applicatif partagé par toutes les routes API.
// Ce fichier définit : la liste fermée des codes d'erreur stables (le
// contrat côté client, à ne pas faire évoluer à la légère — voir API ET
// SERVICES NAMINTO ACADÉMIE), leur mapping vers un status HTTP, et la
// classe AppError à lever depuis les handlers. Consommé par
// lib/api/response.ts (handleRoute) qui transforme un AppError levé en
// réponse JSON `{ success: false, error }`.
export type ErrorCode =
  | "AUTH_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "INVALID_STATE"
  | "VALIDATION_ERROR"
  | "PAYMENT_REQUIRED"
  | "PAYMENT_FAILED"
  | "ACCESS_DENIED"
  | "COURSE_NOT_ELIGIBLE"
  | "COURSE_LOCKED"
  | "QUIZ_NOT_AVAILABLE"
  | "VALIDATION_REQUIRED"
  | "DEADLINE_EXCEEDED"
  | "ACCOUNT_BLOCKED"
  | "ACCOUNT_BANNED"
  | "ACCOUNT_PENDING_DELETION"
  | "EMAIL_NOT_VERIFIED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  AUTH_REQUIRED: 401,
  INVALID_CREDENTIALS: 401,
  FORBIDDEN: 403,
  RESOURCE_NOT_FOUND: 404,
  INVALID_STATE: 409,
  VALIDATION_ERROR: 422,
  PAYMENT_REQUIRED: 402,
  PAYMENT_FAILED: 402,
  ACCESS_DENIED: 403,
  COURSE_NOT_ELIGIBLE: 403,
  COURSE_LOCKED: 403,
  QUIZ_NOT_AVAILABLE: 409,
  VALIDATION_REQUIRED: 409,
  DEADLINE_EXCEEDED: 409,
  ACCOUNT_BLOCKED: 403,
  ACCOUNT_BANNED: 403,
  ACCOUNT_PENDING_DELETION: 403,
  EMAIL_NOT_VERIFIED: 403,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

/**
 * Erreur applicative structurée. Ne jamais exposer de détails internes
 * (stack, requête SQL, secrets) dans `message` : ce texte est renvoyé au client.
 *
 * `messageKey` (optionnel) : identifiant stable vers `lib/i18n/dictionaries.ts`
 * (`Dictionary["errors"]`) pour les erreurs atteignables depuis une surface
 * publique/membre — voir lib/api/response.ts pour la résolution locale.
 * N'existe que pour ce sous-ensemble : l'espace Seuil reste français
 * uniquement (portée i18n documentée dans dictionaries.ts), donc la grande
 * majorité des `throw new AppError(...)` du code n'a délibérément pas de
 * clé — `message` (français) reste alors la seule source de vérité,
 * exactement comme avant.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;
  readonly messageKey?: string;

  constructor(
    code: ErrorCode,
    message: string,
    details?: unknown,
    messageKey?: string,
  ) {
    super(message);
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
    this.messageKey = messageKey;
  }
}
