import crypto from "node:crypto";
import type { Workflow, RunResult } from "./types.js";
import { renderTemplates } from "./template.js";
import { registry } from "../connectors/index.js";
import { logEvent } from "../storage/runLogger.js";

export async function runWorkflow(workflow: Workflow, triggerPayload: any): Promise<RunResult> {
  const runId = crypto.randomUUID();
  const outputs: Record<string, any> = { trigger: triggerPayload };
  const ctx = outputs;

  logEvent(runId, { type: "run_start", workflowId: workflow.id, name: workflow.name });

  for (const step of workflow.steps) {
    if (step.type !== "action") continue;

    const action = registry.getAction(step.connector, step.operation);
    if (!action) {
      logEvent(runId, { type: "step_error", stepId: step.id, error: "Action not found" });
      throw new Error(`Action not found: ${step.connector}.${step.operation}`);
    }

    const input = renderTemplates(step.input ?? {}, ctx);
    logEvent(runId, { type: "step_start", stepId: step.id, connector: step.connector, operation: step.operation, input });

    const output = await action(input, ctx);
    outputs[step.id] = output;

    logEvent(runId, { type: "step_success", stepId: step.id, output });
  }

  logEvent(runId, { type: "run_success" });
  return { runId, outputs };
}