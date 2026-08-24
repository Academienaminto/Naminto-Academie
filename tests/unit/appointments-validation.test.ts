import { describe, expect, it } from "vitest";
import {
  proposeAppointmentSchema,
  scheduleSchema,
} from "@/modules/appointments/validation";

describe("proposeAppointmentSchema", () => {
  it("accepts a valid ISO datetime", () => {
    const result = proposeAppointmentSchema.safeParse({
      proposedAt: "2026-09-01T10:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-ISO date string", () => {
    const result = proposeAppointmentSchema.safeParse({
      proposedAt: "1 septembre 2026",
    });
    expect(result.success).toBe(false);
  });
});

describe("scheduleSchema", () => {
  it("rejects a missing scheduledAt", () => {
    expect(scheduleSchema.safeParse({}).success).toBe(false);
  });
});
