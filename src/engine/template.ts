function getByPath(obj: any, path: string) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function renderTemplates(value: any, ctx: any): any {
  if (typeof value === "string") {
    return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, expr) => {
      const v = getByPath(ctx, expr.trim());
      return v === undefined || v === null ? "" : String(v);
    });
  }
  if (Array.isArray(value)) return value.map(v => renderTemplates(v, ctx));
  if (value && typeof value === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) out[k] = renderTemplates(v, ctx);
    return out;
  }
  return value;
}