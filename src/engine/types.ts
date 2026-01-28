export type StepType = "trigger" | "action";

export type WorkflowStep = {
  id: string;
  type: StepType;
  connector: string;   // "webhook" | "http"
  operation: string;   // "received" | "request"
  input?: Record<string, any>;
};

export type Workflow = {
  id: string;
  name: string;
  steps: WorkflowStep[];
};

export type RunResult = {
  runId: string;
  outputs: Record<string, any>;
};
