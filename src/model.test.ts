import {test} from 'node:test';import assert from 'node:assert/strict';import {select,totals,seed,csv,valid,status} from './model.ts';
test('all filtered totals reconcile',()=>{const t=totals(seed);assert.equal(t.billed-t.collected,t.due)});
test('search, status, month combine',()=>assert.equal(select(seed,'ACME','Partial','2026-10').length,1));
test('empty results have zero totals',()=>assert.equal(totals(select(seed,'missing','All','')).due,0));
test('CSV escapes quotes and spreadsheet formulas',()=>assert.ok(csv([{...seed[0],customer:'=SUM("a")'}]).includes('"\'=SUM(""a"")"')));
test('invalid stored records rejected',()=>{assert.equal(valid([{...seed[0],paid:-1}]),false);assert.equal(valid(seed),true)});
test('paid status',()=>assert.equal(status(seed[1]),'Paid'));
