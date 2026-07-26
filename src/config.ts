import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

export interface Config {
  orKey: string;
  nvKey: string;
  orBase: string;
  nvBase: string;
}

const DATA_DIR = join(homedir(), ".procode");
const CONFIG_PATH = join(DATA_DIR, "config.json");

export function loadConfig(): Config {
  const c: Record<string, string> = {};
  try {
    if (existsSync(CONFIG_PATH)) {
      Object.assign(c, JSON.parse(readFileSync(CONFIG_PATH, "utf-8")));
    }
  } catch { }
  return {
    orKey: c.or_key || process.env.PROCODE_OR_KEY || "",
    nvKey: c.nv_key || process.env.PROCODE_NV_KEY || "",
    orBase: c.or_base || process.env.PROCODE_OR_BASE || "https://openrouter.ai/api/v1",
    nvBase: c.nv_base || process.env.PROCODE_NV_BASE || "https://integrate.api.nvidia.com/v1",
  };
}
