import React from 'react';
import { go } from '../lib/store.jsx';

const PAGES = {
  about: ['About FreshNest', ['Shop fresh produce, pantry staples and everyday essentials in one place.']],
  contact: ['Contact us', ['Open the Help Centre to create or follow up on a support ticket.']],
  help: ['Help centre', ['Find answers, raise a ticket, or report a problem with an order.']],
  privacy: ['Privacy information', ['FreshNest stores your account information, addresses, orders and support messages on its server to provide these services.', 'Your browser stores your sign-in session and recent activity. Location access requires your permission.']],
  terms: ['Ordering information', ['Check item quantities, fees and the delivery address before placing your order. Availability and final prices are checked at checkout.']],
  partner: ['Deliver with FreshNest', ['Delivery partners can sign in and accept assignments once an operator has granted access. Contact the operator to apply.']],
  shipping: ['Shipping & delivery information', ['Delivery availability depends on your PIN code. Checkout shows estimated timing and fees.']],
  returns: ['Returns & refunds', ['For a delivered order, open Returns & refunds to submit a request. Use a support ticket to report individual missing or damaged items.']],
  sell: ['Sell on FreshNest', ['Submit a seller application. Approved sellers can manage listings, prices and stock in the seller workspace.']],
  payment: ['Payment information', ['Cash on Delivery is available at checkout. When online payments are enabled, Razorpay provides eligible payment options.']],
  cancellation: ['Cancellation information', ['Pending and confirmed orders can be cancelled from My orders. Contact support for help with orders further along in preparation.']],
};
export default function Info({ slug }) {
  const page = PAGES[slug]; if (!page) return <section className="day3-page"><div className="empty-state"><h3>Page not found</h3><button className="primary" onClick={() => go('/')}>Home</button></div></section>;
  return <section className="day3-page policy-page"><div className="page-topline"><button className="back-link" onClick={() => history.back()}>← Back</button><span className="eyebrow">FRESHNEST</span></div><h1>{page[0]}</h1><div className="panel policy-content">{page[1].map((p, i) => <p key={i}>{p}</p>)}{['contact', 'help'].includes(slug) && <button className="primary" onClick={() => go('/support')}>Open Help Centre</button>}{slug === 'sell' && <button className="primary" onClick={() => go('/seller')}>Open seller workspace</button>}{(slug === 'cancellation' || slug === 'returns') && <button className="secondary" onClick={() => go('/support?tab=returns')}>Returns & refunds</button>}</div></section>;
}
export const INFO_LINKS = [['About FreshNest', 'about'], ['Contact us', 'contact'], ['Help centre', 'help'], ['Privacy policy', 'privacy'], ['Terms & conditions', 'terms'], ['Cancellation policy', 'cancellation'], ['Return & refund policy', 'returns'], ['Shipping & delivery', 'shipping'], ['Sell on FreshNest', 'sell'], ['Payment information', 'payment'], ['Delivery partners', 'partner']];
