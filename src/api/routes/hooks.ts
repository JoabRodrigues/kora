import type { FastifyInstance } from "fastify";
import { loadWorkflow } from "../../../workflows/loader.js";
import { runWorkflow } from "../../engine/engine.js";

export async function hooksRoutes(app: FastifyInstance) {
  app.post("/hooks/:workflowId", async (req, reply) => {
    const { workflowId } = req.params as { workflowId: string };
    const wf = loadWorkflow(workflowId);

    const result = await runWorkflow(wf, req.body);
    return reply.send({ ok: true, ...result });
  });
}