import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Workflow } from "../src/engine/types.js";

const DIR = join(process.cwd(), "workflows");

export function loadWorkflow(id: string): Workflow {
  const raw = readFileSync(join(DIR, `${id}.json`), "utf-8");
  return JSON.parse(raw);
}

export function listWorkflows(): string[] {
  return readdirSync(DIR)
    .filter(f => f.endsWith(".json"))
    .map(f => f.replace(".json", ""));
}