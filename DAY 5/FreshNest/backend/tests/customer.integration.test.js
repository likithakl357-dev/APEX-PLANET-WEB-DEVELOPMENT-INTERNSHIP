import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { brands } from '../../src/data/products.js';

const base = process.env.FRESHNEST_QA_API;
const qaTokens = [process.env.FRESHNEST_QA_TOKEN,process.env.FRESHNEST_QA_OTHER_TOKEN];
test('PostgreSQL-backed customer checkout, retry and cancellation', { skip: !base || qaTokens.some(token=>!token) }, async () => {
  async function request(path, { token, method = 'GET', body, status = 200 } = {}) {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: 'Bearer ' + token } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json();
    assert.equal(response.status, status, method + ' ' + path + ': ' + (data.error ?? response.status));
    return data;
  }


  assert.equal((await request('/health')).ok, true);
  assert.equal((await request('/categories')).length, 20);
  const { items, total } = await request('/products?limit=500');
  assert.equal(total, 400);
  assert.equal(new Set(items.map(p => p.brand)).size, brands.length);
  const product = items.find(p => p.stock >= 3 && Math.round(p.price * (100 - p.discount) / 100) >= 49);
  assert.ok(product);

  const [token,other] = qaTokens;
  await request('/cart', { status: 401 });
  await request('/admin/products', { token, status: 403 });
  const address = await request('/addresses', {
    token, method: 'POST', status: 201,
    body: { line1: '1 QA Street', city: 'Chennai', state: 'Tamil Nadu', pin: '600001' }
  });
  assert.equal(address.isDefault, true);
  await request('/addresses/' + address.id, { token: other, method: 'PUT', body: { line1: '2 QA Street' }, status: 404 });

  const cartPath = '/cart/items/' + product.id;
  await request(cartPath, { token, method: 'PUT', body: { quantity: 2 } });
  assert.equal((await request('/cart', { token })).items[0].quantity, 2);
  await request('/wishlist/' + product.id, { token, method: 'PUT', body: { saved: true } });
  assert.ok((await request('/wishlist', { token })).items.includes(product.id));
  await request('/orders', { token, method: 'POST', body: { addressId: address.id, paymentMethod: 'CARD' }, status: 400 });
  const orderRequest = { token, method: 'POST', body: { addressId: address.id, idempotencyKey: randomUUID() }, status: 201 };
  const [order, retry] = await Promise.all([
    request('/orders', orderRequest),
    request('/orders', orderRequest)
  ]);
  assert.equal(order.id, retry.id);
  assert.equal(order.paymentMethod, 'COD');
  assert.equal(order.paymentStatus, 'PENDING');
  assert.equal(order.items[0].quantity, 2);
  assert.equal((await request('/orders', { token })).length, 1);
  assert.equal((await request('/cart', { token })).items.length, 0);
  assert.equal((await request('/products/' + product.id)).stock, product.stock - 2);
  await request('/orders/' + order.id, { token: other, status: 404 });
  await request('/orders/' + order.id + '/cancel', { token, method: 'POST' });
  assert.equal((await request('/orders/' + order.id, { token })).status, 'CANCELLED');
  assert.equal((await request('/products/' + product.id)).stock, product.stock);

  const ticket = await request('/support/tickets', {
    token, method: 'POST', status: 201,
    body: { subject: 'QA order question', message: 'Test message for the isolated database.' }
  });
  assert.ok((await request('/support/tickets', { token })).some(t => t.id === ticket.id));
  assert.deepEqual(await request('/support/tickets', { token: other }), []);
});

