import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";

describe("password hashing", () => {
  it("never stores the password in clear text", async () => {
    const hash = await hashPassword("correcthorsebattery");
    expect(hash).not.toContain("correcthorsebattery");
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword("correcthorsebattery");
    await expect(verifyPassword(hash, "correcthorsebattery")).resolves.toBe(
      true,
    );
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correcthorsebattery");
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("never throws on a malformed hash", async () => {
    await expect(verifyPassword("not-a-real-hash", "anything")).resolves.toBe(
      false,
    );
  });
});
