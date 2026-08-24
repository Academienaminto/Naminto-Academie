import { describe, expect, it } from "vitest";
import { enrollSchema } from "@/modules/enrollment/validation";

describe("enrollSchema", () => {
  it("accepts a valid cursusId", () => {
    expect(enrollSchema.safeParse({ cursusId: "cursus_1" }).success).toBe(
      true,
    );
  });

  it("rejects an empty cursusId", () => {
    expect(enrollSchema.safeParse({ cursusId: "" }).success).toBe(false);
  });
});
