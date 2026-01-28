import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

type WorkflowsResponse = { workflows: string[] };

const API_BASE = "http://localhost:3000";

export default function App() {
  const [workflows, setWorkflows] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [payload, setPayload] = useState<string>(
    JSON.stringify({ event: "signup", user: "joab" }, null, 2)
  );
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const canRun = useMemo(() => selected.trim().length > 0, [selected]);

  async function loadWorkflows() {
    setError("");
    const res = await fetch(`${API_BASE}/workflows`);
    if (!res.ok) throw new Error(`Erro ao listar workflows: ${res.status}`);
    const data = (await res.json()) as WorkflowsResponse;
    setWorkflows(data.workflows);
    if (!selected && data.workflows.length > 0) setSelected(data.workflows[0]);
  }

  async function run() {
    setError("");
    setResult("");
    setLoading(true);
    try {
      const parsed = JSON.parse(payload); // valida JSON
      const res = await fetch(`${API_BASE}/hooks/${selected}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      // deixa bonito se for JSON
      try {
        const json = JSON.parse(text);
        setResult(JSON.stringify(json, null, 2));
      } catch {
        setResult(text);
      }
    } catch (e: any) {
      setError(e?.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkflows().catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Kora</h1>
      <p style={{ marginTop: 6, opacity: 0.75 }}>
        MVP — Trigger (Webhook) → Actions
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 16 }}>
        {/* Sidebar */}
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Workflows</strong>
            <button onClick={() => loadWorkflows()} style={{ padding: "6px 10px" }}>
              Reload
            </button>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            >
              {workflows.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <button
              disabled={!canRun || loading}
              onClick={run}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Running..." : "Run workflow"}
            </button>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Endpoint: <code>/hooks/{selected || ":workflowId"}</code>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: 10, borderBottom: "1px solid #eee", background: "#fafafa" }}>
              <strong>Trigger payload (JSON)</strong>
              <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
                (isso vira <code>{"{{trigger.*}}"}</code>)
              </span>
            </div>
            <div style={{ height: 260 }}>
              <Editor
                language="json"
                value={payload}
                onChange={(v) => setPayload(v ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  tabSize: 2,
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ border: "1px solid #f1b2b2", background: "#fff5f5", padding: 12, borderRadius: 10 }}>
              <strong>Erro</strong>
              <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>{error}</pre>
            </div>
          )}

          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: 10, borderBottom: "1px solid #eee", background: "#fafafa" }}>
              <strong>Result</strong>
            </div>
            <pre style={{ margin: 0, padding: 12, whiteSpace: "pre-wrap" }}>
              {result || "—"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
