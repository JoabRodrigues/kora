import { httpConnector } from "./http/action.js";

export type ActionRunner = (input: any, ctx: any) => Promise<any>;

export type ConnectorRegistry = {
  getAction(connector: string, operation: string): ActionRunner | null;
};

export const registry: ConnectorRegistry = {
  getAction(connector, operation) {
    if (connector === "http" && operation === "request") return httpConnector;
    return null;
  }
};