import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { createOrderReceipt } from '../src/lib/orderReceipt.js';

test('creates a valid receipt and paginates a long order', async () => {
  const order = {
    id: 'FNQA123',
    date: '24 November 2026',
    status: 'out_for_delivery',
    payment: 'Cash on Delivery',
    paymentStatus: 'PENDING',
    address: '18 Market Road, Chennai',
    total: 1505,
    bill: { subtotal: 1500, delivery: 0, handling: 5 },
    items: Array.from({ length: 60 }, () => ({ name: 'Fresh produce', qty: 1, price: 25 })),
  };
  const bytes = await createOrderReceipt(order);
  const pdf = await PDFDocument.load(bytes);
  assert.equal(pdf.getTitle(), 'FreshNest order receipt FNQA123');
  assert.ok(pdf.getPageCount() > 1);
});
