import type { FastifyInstance } from "fastify";
import { listWorkflows } from "../../../workflows/loader.js";

export async function workflowsRoutes(app: FastifyInstance) {
  app.get("/workflows", async () => ({ workflows: listWorkflows() }));
}