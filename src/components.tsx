import { useState, type FormEvent } from "react";
import { totals, type Invoice } from "./model";
import type { NewInvoice } from "./api";

export const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value / 100,
  );

export function Metrics({ rows }: { rows: Invoice[] }) {
  const values = totals(rows);
  return (
    <section className="metrics">
      {[
        ["Invoiced", values.billed],
        ["Collected", values.collected],
        ["Outstanding", values.due],
      ].map(([label, value]) => (
        <article key={label}>
          <small>{label}</small>
          <strong>{money(Number(value))}</strong>
          <span>Across {rows.length} matching invoices</span>
        </article>
      ))}
    </section>
  );
}

export function RevenueChart({ rows }: { rows: Invoice[] }) {
  const months = [...new Set(rows.map((row) => row.date.slice(0, 7)))].sort();
  const values = months.map(
    (month) => totals(rows.filter((row) => row.date.startsWith(month))).billed,
  );
  const maximum = Math.max(...values, 1);
  return (
    <section className="panel">
      <div className="panelhead">
        <h2>Revenue by month</h2>
        <span>Filtered invoice values</span>
      </div>
      <div className="chart">
        {months.length ? (
          months.map((month, index) => (
            <div key={month}>
              <span>{money(values[index])}</span>
              <div
                className="bar"
                style={{ height: Math.max(3, (values[index] / maximum) * 130) }}
              />
              <small>{month}</small>
            </div>
          ))
        ) : (
          <p>No revenue to display.</p>
        )}
      </div>
    </section>
  );
}

export function InvoiceForm({
  busy,
  onCreate,
}: {
  busy: boolean;
  onCreate: (value: NewInvoice) => Promise<boolean>;
}) {
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const customer = String(fields.get("customer")).trim();
    const amount = Math.round(Number(fields.get("amount")) * 100);
    if (
      !customer ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount > 1_000_000_000
    ) {
      setError("Enter a customer and an amount between $0.01 and $10,000,000.");
      return;
    }
    setError("");
    if (await onCreate({ customer, amount, date: String(fields.get("date")) }))
      form.reset();
  }
  return (
    <form className="panel form" onSubmit={submit}>
      <h2>New invoice</h2>
      <label>
        Customer
        <input name="customer" required maxLength={100} />
      </label>
      <label>
        Amount USD
        <input
          name="amount"
          type="number"
          required
          min="0.01"
          max="10000000"
          step="0.01"
        />
      </label>
      <label>
        Issue date
        <input name="date" type="date" required />
      </label>
      <button disabled={busy}>Create invoice</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
