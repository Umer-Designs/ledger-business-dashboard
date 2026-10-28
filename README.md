# Ledger Business Dashboard

Independent portfolio project by Umer Khalid, 2026. All example data is fictional.

## Run

```text
pnpm install
pnpm test
pnpm run build
pnpm dev
```

Requires Node 22+ and pnpm.

## Features

React/TypeScript, combined filters, invoice creation, payment state, chart, integer-cent totals, formula-safe CSV export and validated local storage.

## Limitations

Browser-only persistence; no backend connection, accounts, multi-user sync or real customer data.

## Tests

Six model tests cover filtered totals, combined filters, empty results, CSV escaping, stored-data validation and payment status. Run the test command above to verify your environment.

## Design notes

Invoice amounts are stored as integer cents. Search, status and month filters feed the same rows into the table, chart and summary totals. CSV exports quote every cell and prefix formula-like text. Browser storage is validated before use.

MIT licensed. See LICENSE.