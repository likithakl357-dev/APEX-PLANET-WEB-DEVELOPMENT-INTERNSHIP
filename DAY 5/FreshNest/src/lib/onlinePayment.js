import { api } from './api.js';
import { loadScript } from './loadScript.js';

export async function payOrder(orderNumber, contact = {}) {
  const path = '/orders/' + encodeURIComponent(orderNumber) + '/razorpay';
  const current = await api(path + '/reconcile', { method: 'POST' });
  if (current.status === 'PAID') return 'PAID';
  const checkout = await api(path, { method: 'POST' });
  if (checkout.status === 'PAID') return 'PAID';
  await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  if (!window.Razorpay) throw new Error('Razorpay could not load. Try again.');
  return new Promise((resolve, reject) => {
    const widget = new window.Razorpay({
      key: checkout.keyId,
      order_id: checkout.orderId,
      amount: checkout.amount,
      currency: checkout.currency,
      name: 'FreshNest',
      description: 'Order ' + orderNumber,
      prefill: { name: contact.name || '', email: contact.email || '', contact: contact.phone || '' },
      theme: { color: '#32694a' },
      modal: { ondismiss: () => resolve('DISMISSED') },
      handler: async response => {
        try {
          const result = await api(path + '/verify', { method: 'POST', body: response });
          resolve(result.status);
        } catch (error) { reject(error); }
      }
    });
    widget.open();
  });
}
