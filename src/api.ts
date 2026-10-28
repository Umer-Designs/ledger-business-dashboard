import { valid, type Invoice } from "./model.ts";

export type NewInvoice = Pick<Invoice, "customer" | "amount" | "date">;

export function demoSession(): string {
  const key = "ledger-session-v2";
  try {
    const previous = localStorage.getItem(key);
    if (previous && /^[a-f0-9]{64}$/.test(previous)) return previous;
  } catch {
    /* Storage may be disabled; the current visit still works. */
  }
  const value = Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Use an in-memory session. */
  }
  return value;
}

export async function configuredApi(): Promise<string> {
  const response = await fetch("/runtime-config.json", { cache: "no-store" });
  if (!response.ok) return "";
  const config = await response.json();
  if (!config.apiUrl) return "";
  const url = new URL(config.apiUrl);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname))
  ) {
    throw new Error("Invalid service configuration");
  }
  return url.origin;
}

export function invoiceApi(
  baseUrl: string,
  session: string,
  transport: typeof fetch = fetch,
) {
  async function request(
    path: string,
    method = "GET",
    body?: NewInvoice,
  ): Promise<Invoice[]> {
    const response = await transport(baseUrl + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Demo-Session": session,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(75_000),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        typeof error?.detail === "string"
          ? error.detail
          : `Service returned ${response.status}. Please retry.`,
      );
    }
    const payload = await response.json();
    if (method === "POST" && path === "/invoices") return request("/invoices");
    if (!valid(payload.items))
      throw new Error("The service returned invalid invoice data");
    return payload.items;
  }
  return {
    list: () => request("/invoices"),
    reset: () => request("/invoices/reset", "POST"),
    create: (invoice: NewInvoice) => request("/invoices", "POST", invoice),
    pay: (id: string) =>
      request(`/invoices/${encodeURIComponent(id)}/paid`, "PATCH"),
  };
}
