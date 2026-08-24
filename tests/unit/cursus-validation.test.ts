import { describe, expect, it } from "vitest";
import {
  createCourseSchema,
  createCursusSchema,
  createLevelSchema,
} from "@/modules/cursus/validation";

describe("createCursusSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = createCursusSchema.safeParse({ title: "Cursus initiatique" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createCursusSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });
});

describe("createLevelSchema", () => {
  it("accepts level numbers from 1 to 9", () => {
    for (const number of [1, 5, 9]) {
      expect(
        createLevelSchema.safeParse({ number, name: `Niveau ${number}` })
          .success,
      ).toBe(true);
    }
  });

  it("rejects level number 0 and 10", () => {
    expect(createLevelSchema.safeParse({ number: 0, name: "X" }).success).toBe(
      false,
    );
    expect(
      createLevelSchema.safeParse({ number: 10, name: "X" }).success,
    ).toBe(false);
  });
});

describe("createCourseSchema", () => {
  it("accepts positions from 1 to 6", () => {
    for (const position of [1, 3, 6]) {
      expect(
        createCourseSchema.safeParse({
          levelId: "level_1",
          position,
          title: "Cours",
        }).success,
      ).toBe(true);
    }
  });

  it("rejects position 0 and 7", () => {
    expect(
      createCourseSchema.safeParse({
        levelId: "level_1",
        position: 0,
        title: "Cours",
      }).success,
    ).toBe(false);
    expect(
      createCourseSchema.safeParse({
        levelId: "level_1",
        position: 7,
        title: "Cours",
      }).success,
    ).toBe(false);
  });

  it("defaults currency to XOF", () => {
    const result = createCourseSchema.parse({
      levelId: "level_1",
      position: 1,
      title: "Cours",
    });
    expect(result.currency).toBe("XOF");
  });
});
