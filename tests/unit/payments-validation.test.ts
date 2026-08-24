import { describe, expect, it } from "vitest";
import { createOrderSchema } from "@/modules/payments/validation";

describe("createOrderSchema", () => {
  it("accepts a valid productId", () => {
    expect(createOrderSchema.safeParse({ productId: "product_1" }).success).toBe(
      true,
    );
  });

  it("rejects an empty productId", () => {
    expect(createOrderSchema.safeParse({ productId: "" }).success).toBe(false);
  });
});
