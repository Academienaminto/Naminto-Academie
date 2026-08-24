import { describe, expect, it } from "vitest";
import { updatePreferenceSchema } from "@/modules/notifications/validation";

describe("updatePreferenceSchema", () => {
  it("accepts a partial update", () => {
    expect(updatePreferenceSchema.safeParse({ enabled: false }).success).toBe(
      true,
    );
  });

  it("accepts an empty object", () => {
    expect(updatePreferenceSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a non-boolean value", () => {
    expect(
      updatePreferenceSchema.safeParse({ enabled: "yes" }).success,
    ).toBe(false);
  });
});
