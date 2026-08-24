import { describe, expect, it } from "vitest";
import {
  createCommentSchema,
  createPostSchema,
  postStatusSchema,
} from "@/modules/blog/validation";

describe("createPostSchema", () => {
  it("accepts a minimal valid payload", () => {
    expect(
      createPostSchema.safeParse({ title: "Titre", content: "Contenu" })
        .success,
    ).toBe(true);
  });

  it("rejects an empty title", () => {
    expect(
      createPostSchema.safeParse({ title: "", content: "Contenu" }).success,
    ).toBe(false);
  });

  it("defaults language to fr", () => {
    const result = createPostSchema.parse({ title: "T", content: "C" });
    expect(result.language).toBe("fr");
  });
});

describe("postStatusSchema", () => {
  it("rejects an invalid status", () => {
    expect(postStatusSchema.safeParse({ status: "INCONNU" }).success).toBe(
      false,
    );
  });

  it("accepts PUBLIE", () => {
    expect(postStatusSchema.safeParse({ status: "PUBLIE" }).success).toBe(
      true,
    );
  });
});

describe("createCommentSchema", () => {
  it("rejects an empty comment", () => {
    expect(createCommentSchema.safeParse({ content: "" }).success).toBe(
      false,
    );
  });
});
