import { handleRoute, ok } from "@/lib/api/response";
import { requireUser } from "@/lib/auth/guards";
import { createOrderSchema } from "@/modules/payments/validation";
import { purchaseProduct } from "@/modules/payments/service";

export const POST = handleRoute(async (req) => {
  const user = await requireUser();
  const body = createOrderSchema.parse(await req.json());
  const result = await purchaseProduct(user.id, body.productId);
  return ok(result, 201);
});
