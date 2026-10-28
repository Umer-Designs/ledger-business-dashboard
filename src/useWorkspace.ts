import { useEffect, useRef, useState } from "react";
import { configuredApi, demoSession, invoiceApi, type NewInvoice } from "./api";
import { seed, valid, type Invoice } from "./model";

function localRows(): Invoice[] {
  try {
    const rows = JSON.parse(localStorage.getItem("ledger-v1") || "null");
    if (valid(rows)) return rows;
  } catch {
    /* Invalid or blocked storage starts with sample data. */
  }
  return seed;
}

export function useWorkspace() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [remote, setRemote] = useState(false);
  const api = useRef<ReturnType<typeof invoiceApi> | null>(null);
  const locked = useRef(false);

  function local() {
    api.current = null;
    setRemote(false);
    setRows(localRows());
    setError("");
    setBusy(false);
  }

  async function connect() {
    setBusy(true);
    setError("");
    try {
      const base = await configuredApi();
      if (!base) {
        local();
        return;
      }
      api.current = invoiceApi(base, demoSession());
      setRemote(true);
      let loaded = await api.current.list();
      if (!loaded.length) loaded = await api.current.reset();
      setRows(loaded);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to connect to the service",
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void connect();
  }, []);

  async function change(operation: () => Promise<Invoice[]> | Invoice[]) {
    if (locked.current) return false;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await operation();
      setRows(next);
      if (!api.current) {
        try {
          localStorage.setItem("ledger-v1", JSON.stringify(next));
        } catch {
          setError(
            "Storage unavailable. Local changes last for this visit only.",
          );
        }
      }
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Update failed. Please retry.",
      );
      return false;
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return {
    rows,
    busy,
    error,
    remote,
    connect,
    local,
    create: (invoice: NewInvoice) =>
      change(() =>
        api.current
          ? api.current.create(invoice)
          : [...rows, { ...invoice, id: crypto.randomUUID(), paid: 0 }],
      ),
    pay: (id: string) =>
      change(() =>
        api.current
          ? api.current.pay(id)
          : rows.map((row) =>
              row.id === id ? { ...row, paid: row.amount } : row,
            ),
      ),
    reset: () => change(() => (api.current ? api.current.reset() : seed)),
  };
}
