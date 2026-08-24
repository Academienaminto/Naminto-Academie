import { describe, expect, it } from "vitest";
import { getClientIp, isRateLimited } from "@/lib/security/rate-limit";

describe("isRateLimited", () => {
  it("allows calls up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(key, 5, 60_000)).toBe(false);
    }
    expect(isRateLimited(key, 5, 60_000)).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      isRateLimited(keyA, 3, 60_000);
    }
    expect(isRateLimited(keyA, 3, 60_000)).toBe(true);
    expect(isRateLimited(keyB, 3, 60_000)).toBe(false);
  });
});

describe("getClientIp", () => {
  it("uses the last address in x-forwarded-for (added by the trusted proxy, not client-spoofable)", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" },
    });
    expect(getClientIp(req)).toBe("70.41.3.18");
  });

  it("falls back to x-real-ip then unknown", () => {
    const withRealIp = new Request("http://localhost", {
      headers: { "x-real-ip": "203.0.113.9" },
    });
    expect(getClientIp(withRealIp)).toBe("203.0.113.9");

    const withNothing = new Request("http://localhost");
    expect(getClientIp(withNothing)).toBe("unknown");
  });
});
