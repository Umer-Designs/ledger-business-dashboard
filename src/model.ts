export type Invoice = {
  id: string;
  customer: string;
  amount: number;
  paid: number;
  date: string;
};
export const seed: Invoice[] = [
  {
    id: "INV-001",
    customer: "Acme Studio",
    amount: 125000,
    paid: 50000,
    date: "2026-10-05",
  },
  {
    id: "INV-002",
    customer: "North Workshop",
    amount: 89999,
    paid: 89999,
    date: "2026-10-12",
  },
  {
    id: "INV-003",
    customer: "Field Collective",
    amount: 34050,
    paid: 0,
    date: "2026-09-18",
  },
  {
    id: "INV-004",
    customer: "Paper & Form",
    amount: 178000,
    paid: 178000,
    date: "2026-10-20",
  },
  {
    id: "INV-005",
    customer: "Harbor Design",
    amount: 64000,
    paid: 0,
    date: "2026-08-29",
  },
];
export const status = (r: Invoice) =>
  r.paid === r.amount ? "Paid" : r.paid ? "Partial" : "Unpaid";
export function select(
  rows: Invoice[],
  query: string,
  filter: string,
  month: string,
) {
  return rows.filter(
    (r) =>
      r.customer.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All" || status(r) === filter) &&
      (!month || r.date.startsWith(month)),
  );
}
export function totals(rows: Invoice[]) {
  return rows.reduce(
    (a, r) => ({
      billed: a.billed + r.amount,
      collected: a.collected + r.paid,
      due: a.due + r.amount - r.paid,
    }),
    { billed: 0, collected: 0, due: 0 },
  );
}
export function csv(rows: Invoice[]) {
  const cell = (v: string) =>
    '"' + (/^[=+@\-\t\r]/.test(v) ? "'" : "") + v.replaceAll('"', '""') + '"';
  return (
    "Invoice,Customer,Amount USD,Paid USD,Date\r\n" +
    rows
      .map((r) =>
        [
          r.id,
          r.customer,
          (r.amount / 100).toFixed(2),
          (r.paid / 100).toFixed(2),
          r.date,
        ]
          .map(cell)
          .join(","),
      )
      .join("\r\n")
  );
}
export function valid(rows: unknown): rows is Invoice[] {
  return (
    Array.isArray(rows) &&
    rows.length <= 10000 &&
    rows.every(
      (r) =>
        r &&
        typeof r.id === "string" &&
        typeof r.customer === "string" &&
        typeof r.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(r.date) &&
        Number.isSafeInteger(r.amount) &&
        r.amount > 0 &&
        Number.isSafeInteger(r.paid) &&
        r.paid >= 0 &&
        r.paid <= r.amount,
    )
  );
}
