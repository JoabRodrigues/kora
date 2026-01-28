import { mkdirSync, appendFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const LOG_DIR = join(process.cwd(), "logs");

export function logEvent(runId: string, event: any) {
  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const file = join(LOG_DIR, `${runId}.jsonl`);
  appendFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n");
}
