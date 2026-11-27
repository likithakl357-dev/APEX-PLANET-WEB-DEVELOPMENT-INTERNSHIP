import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { validSignature } from '../src/razorpay.js';

test('Razorpay signature verification rejects changed and malformed payloads', () => {
  const secret = 'local-test-secret';
  const data = 'order_test|pay_test';
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  assert.ok(validSignature(data, signature, secret));
  assert.ok(!validSignature('order_different|pay_test', signature, secret));
  assert.ok(!validSignature(data, signature, 'different-secret'));
  assert.ok(!validSignature(data, 'xyz', secret));
});
