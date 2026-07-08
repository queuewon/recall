import { readFileSync } from "node:fs";
import type { z } from "zod";

export interface JsonSchemaObject {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
  [key: string]: unknown;
}

export interface PromptTemplate<T> {
  name: string;
  modelTier: "fast" | "quality";
  responseSchema: z.ZodType<T>;
  toolInputSchema: JsonSchemaObject;
  render(variables: Record<string, string>): { user: string };
}

function escapeForPrompt(value: string): string {
  return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function loadPromptTemplate<T>(config: {
  name: string;
  filePath: string;
  modelTier: "fast" | "quality";
  responseSchema: z.ZodType<T>;
  toolInputSchema: JsonSchemaObject;
}): PromptTemplate<T> {
  const raw = readFileSync(config.filePath, "utf-8");

  return {
    name: config.name,
    modelTier: config.modelTier,
    responseSchema: config.responseSchema,
    toolInputSchema: config.toolInputSchema,
    render(variables) {
      const user = raw.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
        const value = variables[key];
        if (value === undefined) {
          throw new Error(`Missing prompt variable: ${key}`);
        }
        return escapeForPrompt(value);
      });
      return { user };
    }
  };
}
