import { describe, expect, it } from "vitest";
import {
  ALERT_INTERVAL_DAYS,
  DEADLINE_DURATION_DAYS,
  addDays,
} from "@/modules/deadlines/validation";

describe("addDays", () => {
  it("adds whole days to a date without mutating the input", () => {
    const start = new Date("2026-01-01T10:00:00.000Z");
    const result = addDays(start, 30);
    expect(result.getUTCDate()).toBe(31);
    expect(start.toISOString()).toBe("2026-01-01T10:00:00.000Z");
  });

  it("supports negative offsets (used to compute cutoffs)", () => {
    const start = new Date("2026-01-31T00:00:00.000Z");
    const result = addDays(start, -7);
    expect(result.getUTCDate()).toBe(24);
  });
});

describe("default durations (RÈGLES MÉTIER §24)", () => {
  it("uses a 30-day default deadline and 7-day alert interval", () => {
    expect(DEADLINE_DURATION_DAYS).toBe(30);
    expect(ALERT_INTERVAL_DAYS).toBe(7);
  });
});
