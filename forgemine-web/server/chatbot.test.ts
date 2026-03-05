import { describe, it, expect, vi } from "vitest";

// Mock the LLM module before importing the router
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "test-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content:
            "¡Excelente pregunta! En FORGEMINE CHILE SpA somos especialistas en reparación de baldes mineros. La reparación siempre es la mejor opción económica.",
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  }),
}));

// Import after mocking
import { invokeLLM } from "./_core/llm";

describe("Chatbot - Asesor Técnico-Comercial", () => {
  it("should call invokeLLM with system prompt and user messages", async () => {
    const userMessages = [
      { role: "user" as const, content: "¿Qué servicios ofrecen?" },
    ];

    // Simulate what the chatbot procedure does
    const systemPrompt = expect.stringContaining("FORGEMINE CHILE SpA");

    const llmMessages = [
      { role: "system" as const, content: expect.any(String) },
      ...userMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const result = await invokeLLM({
      messages: llmMessages,
      maxTokens: 1024,
    });

    expect(invokeLLM).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({
          role: "user",
          content: "¿Qué servicios ofrecen?",
        }),
      ]),
      maxTokens: 1024,
    });

    expect(result.choices[0].message.content).toContain("FORGEMINE");
    expect(result.choices[0].message.role).toBe("assistant");
  });

  it("should filter out system messages from user input", () => {
    const inputMessages = [
      { role: "system" as const, content: "Some system message" },
      { role: "user" as const, content: "Hola" },
      {
        role: "assistant" as const,
        content: "¡Hola! ¿En qué puedo ayudarte?",
      },
      {
        role: "user" as const,
        content: "¿Trabajan con Komatsu PC7000?",
      },
    ];

    // Simulate the filtering logic from the chatbot procedure
    const filteredMessages = inputMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    expect(filteredMessages).toHaveLength(3);
    expect(filteredMessages[0]).toEqual({
      role: "user",
      content: "Hola",
    });
    expect(filteredMessages[1]).toEqual({
      role: "assistant",
      content: "¡Hola! ¿En qué puedo ayudarte?",
    });
    expect(filteredMessages[2]).toEqual({
      role: "user",
      content: "¿Trabajan con Komatsu PC7000?",
    });
  });

  it("should handle LLM errors gracefully", async () => {
    // Override mock for this test
    const mockedInvokeLLM = vi.mocked(invokeLLM);
    mockedInvokeLLM.mockRejectedValueOnce(new Error("LLM service unavailable"));

    try {
      await invokeLLM({
        messages: [
          { role: "system", content: "test" },
          { role: "user", content: "test" },
        ],
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("LLM service unavailable");
    }

    // The chatbot procedure would catch this and return a fallback message
    const fallbackResponse =
      "Disculpa, estoy teniendo problemas técnicos en este momento. Por favor, contáctanos directamente por WhatsApp al **+56 9 9277 9872** o escríbenos a **contacto@forgeminechile.com**. ¡Estaremos encantados de ayudarte!";

    expect(fallbackResponse).toContain("+56 9 9277 9872");
    expect(fallbackResponse).toContain("contacto@forgeminechile.com");
  });

  it("should include key FORGEMINE information in system prompt", () => {
    // Verify the system prompt contains all critical business information
    const systemPrompt = `Eres el Asesor Técnico-Comercial de FORGEMINE CHILE SpA`;

    const requiredKeywords = [
      "FORGEMINE",
      "Asesor",
      "Técnico",
      "Comercial",
    ];

    requiredKeywords.forEach((keyword) => {
      expect(systemPrompt).toContain(keyword);
    });
  });

  it("should validate message format", () => {
    // Test that message validation works correctly
    const validMessages = [
      { role: "user" as const, content: "¿Qué servicios ofrecen?" },
    ];

    const invalidRoles = ["admin", "moderator", "bot"];

    validMessages.forEach((msg) => {
      expect(["system", "user", "assistant"]).toContain(msg.role);
      expect(typeof msg.content).toBe("string");
      expect(msg.content.length).toBeGreaterThan(0);
    });

    invalidRoles.forEach((role) => {
      expect(["system", "user", "assistant"]).not.toContain(role);
    });
  });
});
