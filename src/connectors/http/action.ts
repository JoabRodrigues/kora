export async function httpConnector(input: any) {
  const method = input.method ?? "GET";
  const url = input.url;
  const headers = input.headers ?? {};
  const body = input.body ? JSON.stringify(input.body) : undefined;

  const res = await fetch(url, { method, headers, body });
  const contentType = res.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  return { status: res.status, data };
}