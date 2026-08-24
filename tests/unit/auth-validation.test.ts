import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/modules/auth/validation";

describe("registerSchema", () => {
  it("accepts a valid payload", () => {
    const result = registerSchema.safeParse({
      email: "membre@naminto.test",
      password: "correcthorsebattery",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "correcthorsebattery",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "membre@naminto.test",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("defaults language to fr", () => {
    const result = registerSchema.parse({
      email: "membre@naminto.test",
      password: "correcthorsebattery",
    });
    expect(result.language).toBe("fr");
  });
});

describe("loginSchema", () => {
  it("accepts a valid payload", () => {
    const result = loginSchema.safeParse({
      email: "membre@naminto.test",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "membre@naminto.test",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
