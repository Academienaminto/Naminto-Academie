import { z } from "zod";

// Schéma de validation d'entrée pour l'étape ACHAT (route
// app/api/v1/payments/purchase) : ne valide que la forme de la requête,
// aucune règle métier (existence/statut du produit, droit déjà acquis) —
// ces contrôles sont faits par modules/payments/service.ts.
export const createOrderSchema = z.object({
  productId: z.string().min(1),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
