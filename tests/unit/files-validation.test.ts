import { describe, expect, it } from "vitest";
import { classifyMimeType, MAX_SIZE_BY_TYPE } from "@/modules/files/validation";

describe("classifyMimeType", () => {
  it("classifies known MIME types", () => {
    expect(classifyMimeType("application/pdf")).toBe("PDF");
    expect(classifyMimeType("image/png")).toBe("IMAGE");
    expect(classifyMimeType("video/mp4")).toBe("VIDEO");
  });

  it("returns null for an unknown MIME type", () => {
    expect(classifyMimeType("application/x-executable")).toBeNull();
  });
});

describe("MAX_SIZE_BY_TYPE", () => {
  it("defines a limit for every file type", () => {
    for (const type of ["IMAGE", "PDF", "DOCUMENT", "VIDEO"] as const) {
      expect(MAX_SIZE_BY_TYPE[type]).toBeGreaterThan(0);
    }
  });
});
