import { handleRoute, ok } from "@/lib/api/response";
import { logout } from "@/modules/auth/service";

export const POST = handleRoute(async () => {
  await logout();
  return ok({ loggedOut: true });
});
