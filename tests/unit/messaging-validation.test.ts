import { describe, expect, it } from "vitest";
import { sendMessageSchema, startConversationSchema } from "@/modules/messaging/validation";

describe("startConversationSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = startConversationSchema.safeParse({ message: "Bonjour" });
    expect(result.success).toBe(true);
  });

  it("defaults contextType to GENERAL", () => {
    const result = startConversationSchema.parse({ message: "Bonjour" });
    expect(result.contextType).toBe("GENERAL");
  });

  it("rejects an empty message", () => {
    expect(startConversationSchema.safeParse({ message: "" }).success).toBe(
      false,
    );
  });
});

describe("sendMessageSchema", () => {
  it("rejects an empty content", () => {
    expect(sendMessageSchema.safeParse({ content: "" }).success).toBe(false);
  });

  it("accepts valid content", () => {
    expect(sendMessageSchema.safeParse({ content: "Merci" }).success).toBe(
      true,
    );
  });
});
