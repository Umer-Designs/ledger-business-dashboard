import { useState } from "react";
import { select, csv, status } from "./model";
import { useWorkspace } from "./useWorkspace";
import { InvoiceForm, Metrics, RevenueChart, money } from "./components";

export default function App() {
  const workspace = useWorkspace();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [month, setMonth] = useState("");
  const [sort, setSort] = useState("date");
  const [showForm, setShowForm] = useState(false);
  const rows = select(workspace.rows, query, filter, month).sort((a, b) =>
    sort === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date),
  );

  function download() {
    const url = URL.createObjectURL(
      new Blob([csv(rows)], { type: "text/csv" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "ledger-invoices.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="layout">
      <aside>
        <a href="../">
          UK<span> / LABS</span>
        </a>
        <h2>
          Ledger<span className="dot">.</span>
        </h2>
        <p>Business workspace</p>
        <nav>◉ &nbsp; Overview</nav>
        <small>
          {workspace.remote ? "CONNECTED WORKSPACE" : "LOCAL DEMONSTRATION"}
          <br />
          Sample invoices · USD
        </small>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">WORKSPACE / FINANCE</p>
            <h1>Business overview</h1>
            <p>Keep revenue, collections and outstanding balances in view.</p>
          </div>
          <button
            disabled={workspace.busy}
            onClick={() => setShowForm(!showForm)}
          >
            + Add invoice
          </button>
        </header>
        <div className="notice">
          {workspace.remote
            ? "Demo workspace saved through the Python API. Access stays with this browser session. Demo records may be cleared after seven days."
            : "Local demo: changes are saved in this browser only."}{" "}
          Use fictional customer information.
        </div>
        {workspace.busy && (
          <p role="status">
            Contacting the service… Free hosting may take up to a minute to
            wake.
          </p>
        )}
        {workspace.error && (
          <div role="alert">
            <p>{workspace.error}</p>
            <button
              disabled={workspace.busy}
              onClick={() => void workspace.connect()}
            >
              Retry connection
            </button>{" "}
            <button disabled={workspace.busy} onClick={workspace.local}>
              Use local demo
            </button>
          </div>
        )}
        <Metrics rows={rows} />
        <RevenueChart rows={rows} />
        {showForm && (
          <InvoiceForm busy={workspace.busy} onCreate={workspace.create} />
        )}
        <section className="panel">
          <div className="panelhead">
            <h2>Invoices</h2>
            <button className="secondary" onClick={download}>
              Export CSV ↓
            </button>
          </div>
          <div className="filters">
            <label>
              Search customer
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer…"
              />
            </label>
            <label>
              Status
              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                {["All", "Paid", "Partial", "Unpaid"].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Month
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>
            <label>
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="date">Newest</option>
                <option value="amount">Largest amount</option>
              </select>
            </label>
          </div>
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Customer / invoice</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <b>{row.customer}</b>
                      <small>{row.id}</small>
                    </td>
                    <td>{row.date}</td>
                    <td>{money(row.amount)}</td>
                    <td>
                      <span className={"badge " + status(row)}>
                        {status(row)}
                      </span>
                    </td>
                    <td>
                      {status(row) !== "Paid" ? (
                        <button
                          className="textbutton"
                          disabled={workspace.busy}
                          onClick={() => void workspace.pay(row.id)}
                        >
                          Mark paid
                        </button>
                      ) : (
                        "Complete"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && !workspace.busy && (
              <p className="empty">No invoices match your filters.</p>
            )}
          </div>
        </section>
        <footer>
          <button
            className="textbutton"
            disabled={workspace.busy}
            onClick={() => {
              if (
                confirm(
                  "Replace the invoices in this workspace with sample data?",
                )
              )
                void workspace.reset();
            }}
          >
            Reset sample data
          </button>
          <a href="../">Umer Khalid portfolio ↗</a>
        </footer>
      </main>
    </div>
  );
}
