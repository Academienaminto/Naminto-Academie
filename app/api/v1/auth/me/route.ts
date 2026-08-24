import { AppError } from "@/lib/errors";
import { handleRoute, ok } from "@/lib/api/response";
import { me } from "@/modules/auth/service";
import { toPublicUser } from "@/modules/auth/serializer";

export const GET = handleRoute(async () => {
  const user = await me();
  if (!user) {
    throw new AppError("AUTH_REQUIRED", "Authentification requise.");
  }
  return ok(toPublicUser(user));
});
