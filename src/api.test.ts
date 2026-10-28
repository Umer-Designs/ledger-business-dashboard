import { test } from "node:test";
import assert from "node:assert/strict";
import { invoiceApi } from "./api.ts";
import { seed } from "./model.ts";

test("API sends workspace identity and validates returned records", async () => {
  const transport = (async (url: string, options: RequestInit) => {
    assert.equal(url, "https://api.example/invoices");
    assert.equal(
      (options.headers as Record<string, string>)["X-Demo-Session"],
      "session",
    );
    return new Response(JSON.stringify({ items: seed }));
  }) as typeof fetch;
  assert.deepEqual(
    await invoiceApi("https://api.example", "session", transport).list(),
    seed,
  );
});

test("API rejects malformed records", async () => {
  const transport = (async () =>
    new Response(JSON.stringify({ items: [{ amount: -1 }] }))) as typeof fetch;
  await assert.rejects(
    invoiceApi("https://api.example", "session", transport).list(),
    /invalid invoice data/,
  );
});

test("API exposes a useful service failure without accepting a failed write", async () => {
  const transport = (async () =>
    new Response(JSON.stringify({ detail: "Database unavailable" }), {
      status: 503,
    })) as typeof fetch;
  await assert.rejects(
    invoiceApi("https://api.example", "session", transport).pay("invoice"),
    /Database unavailable/,
  );
});

test("creating an invoice reloads the authoritative server list", async () => {
  const paths: string[] = [];
  const transport = (async (url: string) => {
    paths.push(url);
    return new Response(
      JSON.stringify(paths.length === 1 ? seed[0] : { items: seed }),
    );
  }) as typeof fetch;
  assert.deepEqual(
    await invoiceApi("https://api.example", "session", transport).create(
      seed[0],
    ),
    seed,
  );
  assert.equal(paths.length, 2);
});
