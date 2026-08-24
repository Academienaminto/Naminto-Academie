import { describe, expect, it } from "vitest";
import {
  createFormationCourseSchema,
  createFormationPartSchema,
  createFormationSchema,
} from "@/modules/formations/validation";

describe("createFormationSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createFormationSchema.safeParse({ title: "Formation photo" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createFormationSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("defaults currency to XOF and language to fr", () => {
    const result = createFormationSchema.parse({ title: "Formation photo" });
    expect(result.currency).toBe("XOF");
    expect(result.language).toBe("fr");
  });

  it("accepts an explicit price", () => {
    const result = createFormationSchema.safeParse({
      title: "Formation photo",
      price: 15000,
    });
    expect(result.success).toBe(true);
  });
});

describe("createFormationPartSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createFormationPartSchema.safeParse({
      position: 1,
      title: "Partie 1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects position 0", () => {
    const result = createFormationPartSchema.safeParse({
      position: 0,
      title: "Partie 1",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFormationCourseSchema", () => {
  it("accepts a minimal valid payload without price", () => {
    const result = createFormationCourseSchema.safeParse({
      formationPartId: "part_1",
      position: 1,
      title: "Cours 1",
    });
    expect(result.success).toBe(true);
  });

  it("does not accept a price field (le prix vit sur la formation, pas le cours)", () => {
    const result = createFormationCourseSchema.parse({
      formationPartId: "part_1",
      position: 1,
      title: "Cours 1",
    });
    expect("price" in result).toBe(false);
  });
});
