import { describe, expect, it } from "vitest";
import { addBookVersionSchema, createBookSchema } from "@/modules/books/validation";

describe("createBookSchema", () => {
  it("accepts a free book without a price", () => {
    const result = createBookSchema.safeParse({ title: "Guide initiatique", isFree: true });
    expect(result.success).toBe(true);
  });

  it("rejects a paid book without a price", () => {
    const result = createBookSchema.safeParse({ title: "Guide initiatique", isFree: false });
    expect(result.success).toBe(false);
  });

  it("rejects a paid book with a price of 0", () => {
    const result = createBookSchema.safeParse({
      title: "Guide initiatique",
      isFree: false,
      price: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a paid book with a positive price", () => {
    const result = createBookSchema.safeParse({
      title: "Guide initiatique",
      isFree: false,
      price: 3000,
    });
    expect(result.success).toBe(true);
  });

  it("defaults isFree to false and currency to XOF", () => {
    const result = createBookSchema.parse({ title: "Guide initiatique", price: 3000 });
    expect(result.isFree).toBe(false);
    expect(result.currency).toBe("XOF");
  });
});

describe("addBookVersionSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = addBookVersionSchema.safeParse({ fileId: "file_1" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing fileId", () => {
    const result = addBookVersionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
