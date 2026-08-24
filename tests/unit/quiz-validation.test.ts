import { describe, expect, it } from "vitest";
import { createQuestionSchema, submitAttemptSchema } from "@/modules/quiz/validation";

const base = {
  question: "Quelle est la bonne réponse ?",
  position: 1,
};

describe("createQuestionSchema", () => {
  it("accepts a CHOIX_UNIQUE question with exactly one correct option", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "CHOIX_UNIQUE",
      options: [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a CHOIX_UNIQUE question with two correct options", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "CHOIX_UNIQUE",
      options: [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: true },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a question with no correct option", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "CHOIX_MULTIPLE",
      options: [
        { label: "A", isCorrect: false },
        { label: "B", isCorrect: false },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a CHOIX_MULTIPLE question with several correct options", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "CHOIX_MULTIPLE",
      options: [
        { label: "A", isCorrect: true },
        { label: "B", isCorrect: true },
        { label: "C", isCorrect: false },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a question with fewer than two options", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "CHOIX_UNIQUE",
      options: [{ label: "A", isCorrect: true }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts a PREUVE_PRATIQUE question with no options", () => {
    const result = createQuestionSchema.safeParse({
      ...base,
      type: "PREUVE_PRATIQUE",
      options: [],
    });
    expect(result.success).toBe(true);
  });
});

describe("submitAttemptSchema", () => {
  it("accepts an answer carrying selectedOptionIds", () => {
    const result = submitAttemptSchema.safeParse({
      answers: [{ questionId: "q1", selectedOptionIds: ["o1"] }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an answer carrying a fileId for a practical evidence question", () => {
    const result = submitAttemptSchema.safeParse({
      answers: [{ questionId: "q1", fileId: "f1" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty answers array", () => {
    const result = submitAttemptSchema.safeParse({ answers: [] });
    expect(result.success).toBe(false);
  });
});
