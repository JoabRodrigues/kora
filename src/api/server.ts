import Fastify from "fastify";
import cors from "@fastify/cors";
import { hooksRoutes } from "./routes/hooks.js";
import { workflowsRoutes } from "./routes/workflows.js";

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

await app.register(hooksRoutes);
await app.register(workflowsRoutes);

app.get("/health", async () => ({ ok: true }));

await app.listen({ port: 3000, host: "0.0.0.0" });
console.log("Kora running on http://localhost:3000 ✅");