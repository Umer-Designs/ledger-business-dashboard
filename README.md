# Ledger business dashboard

A React and TypeScript invoice workspace with filters, payment tracking, revenue charts and CSV export.

[Portfolio](https://umer-designs.github.io) · [Dashboard](https://umer-designs.github.io/dashboard/)

## Run

Requires Node 22+ and pnpm 11.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm run build
pnpm dev
```

The application starts in local sample mode when no service URL is configured. Copy the portfolio's `runtime-config.json` into `public/runtime-config.json` and set `apiUrl` to the running Python service origin to use connected mode. This public file contains a URL only, never credentials. The service must allow the frontend's exact origin in `ALLOWED_ORIGINS`.

## Connected workspace

The browser creates a random 256-bit workspace token and sends it in `X-Demo-Session`. The server stores only its hash alongside invoice records. Invoice creation, payment updates and reset operations are scoped to that workspace. Clearing browser storage loses access to that demonstration workspace; there are no user accounts or recovery flow. Use fictional information only. Demo records may be removed after seven days.

The interface reports connection and write failures, waits for confirmed responses, and offers local sample mode explicitly. It does not silently save failed server writes to a different database. Free hosting can need up to a minute to wake.

## Structure

- `App.tsx`: page composition, filters and table.
- `components.tsx`: invoice form, totals and revenue chart.
- `useWorkspace.ts`: loading, updates and local/connected mode.
- `api.ts`: session token and HTTP client.
- `model.ts`: invoice types, sample records, calculations and CSV export.

Ten automated tests cover calculations, CSV escaping, stored-data validation and the API adapter. API integration tests are in the Stockroom repository. Currency values use integer cents. The chart derives its months from the filtered records.

This is a demonstration, not an accounting service. Browser tokens are not an organization-wide identity or permissions system. MIT licensed.
