import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ToolSet } from "ai";
import type { Config } from "./config";

export interface ModelDef {
  name: string;
  modelId: string;
  provider: "nv" | "or";
  maxTokens: number;
  timeout: number;
}

export const MODELS: ModelDef[] = [
  { name: "Llama4 Mav", modelId: "meta/llama-4-maverick-17b-128e-instruct", provider: "nv", maxTokens: 8192, timeout: 30 },
  { name: "DS V4 Pro", modelId: "deepseek-ai/deepseek-v4-pro", provider: "nv", maxTokens: 16384, timeout: 35 },
  { name: "Nemotron S49", modelId: "nvidia/llama-3.3-nemotron-super-49b-v1", provider: "nv", maxTokens: 8192, timeout: 30 },
  { name: "Nem Reason", modelId: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", provider: "or", maxTokens: 8192, timeout: 25 },
];

const SYSTEM_PROMPT =
  "You are ProCode, a helpful coding assistant. Talk conversationally. Only write code when asked. When you do write code, output files inside ```code blocks with filename on first line as comment. Use the bash tool to run commands when helpful.";

export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export type StreamEvent = {
  type: "text-delta";
  text: string;
} | {
  type: "tool-call";
  name: string;
  input: unknown;
} | {
  type: "tool-result";
  name: string;
  output: unknown;
} | {
  type: "finish";
  model: string;
  usage: LLMUsage;
  content: string;
} | {
  type: "error";
  message: string;
};

export async function* streamResponse(
  messages: { role: "user" | "assistant"; content: string }[],
  tools: ToolSet,
  config: Config
): AsyncGenerator<StreamEvent> {
  for (const m of MODELS) {
    const baseUrl = m.provider === "nv" ? config.nvBase : config.orBase;
    const apiKey = m.provider === "nv" ? config.nvKey : config.orKey;
    if (!apiKey) continue;

    const provider = createOpenAI({ baseURL: baseUrl, apiKey, name: m.provider });
    const model = provider(m.modelId);

    try {
      const result = streamText({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages] as any,
        tools,
      });

      let fullText = "";
      for await (const part of result.stream) {
        if (part.type === "text-delta") {
          fullText += part.text;
          yield { type: "text-delta", text: part.text };
        } else if (part.type === "tool-call") {
          yield { type: "tool-call", name: part.toolName, input: part.input };
        } else if (part.type === "tool-result") {
          yield { type: "tool-result", name: part.toolName, output: part.output };
        }
      }

      const usage = await result.usage;
      yield {
        type: "finish",
        model: m.name,
        content: fullText,
        usage: {
          promptTokens: usage.inputTokens || 0,
          completionTokens: usage.outputTokens || 0,
          totalTokens: usage.totalTokens || 0,
        },
      };
      return;
    } catch (e) {
      yield { type: "error", message: `${m.name}: ${(e as Error).message}` };
      continue;
    }
  }
  yield { type: "error", message: "All models failed" };
}
