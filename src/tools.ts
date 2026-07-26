import { tool } from "ai";
import { z } from "zod";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

export const tools = {
  bash: tool({
    description: "Run a shell command and get its output",
    inputSchema: z.object({
      command: z.string().describe("The shell command to execute"),
    }),
    execute: async ({ command }: { command: string }) => {
      try {
        const out = execSync(command, { timeout: 30000, encoding: "utf-8", maxBuffer: 1024 * 1024 }) as string;
        return out.slice(0, 10000);
      } catch (e: any) {
        return `Exit ${e.status}: ${e.stderr?.slice(0, 5000) || e.message}`;
      }
    },
  }),
  read: tool({
    description: "Read a file from the filesystem",
    inputSchema: z.object({
      path: z.string().describe("Absolute or relative path to the file"),
    }),
    execute: async ({ path }: { path: string }) => {
      try {
        if (!existsSync(path)) return `File not found: ${path}`;
        return readFileSync(path, "utf-8").slice(0, 50000);
      } catch (e: any) {
        return `Error reading ${path}: ${e.message}`;
      }
    },
  }),
  write: tool({
    description: "Write content to a file",
    inputSchema: z.object({
      path: z.string().describe("Path to write to"),
      content: z.string().describe("Content to write"),
    }),
    execute: async ({ path, content }: { path: string; content: string }) => {
      try {
        writeFileSync(path, content, "utf-8");
        return `Written to ${path}`;
      } catch (e: any) {
        return `Error writing ${path}: ${e.message}`;
      }
    },
  }),
  glob: tool({
    description: "Search for files matching a pattern",
    inputSchema: z.object({
      pattern: z.string().describe("Glob pattern (e.g. **/*.ts)"),
    }),
    execute: async ({ pattern }: { pattern: string }) => {
      try {
        const out = execSync(`find . -not -path './node_modules/*' -name "${pattern}" 2>/dev/null | head -100`, { encoding: "utf-8" }) as string;
        return out.trim() || "No matches";
      } catch { return "No matches"; }
    },
  }),
};

export type ProTools = typeof tools;
