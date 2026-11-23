import React from 'react';
import { go } from '../lib/store.jsx';

const SAMPLE = 'Sample content for the FreshNest demo. Not legally approved wording; review with legal counsel before launch.';
const PAGES = {
  about: ['About FreshNest', ['FreshNest is a demo quick-commerce grocery storefront focused on fresh essentials, clear pricing and a thoughtful delivery experience.', SAMPLE]],
  contact: ['Contact us', ['Email: support@freshnest.demo (demo address)', 'Support hours: 8 AM – 10 PM (demo).', 'Use the Help Centre to raise a ticket.']],
  help: ['Help centre', ['Find answers in FAQs, raise a ticket, or report a problem with an order.', SAMPLE]],
  privacy: ['Privacy policy', ['In this frontend demo, your data stays in your browser’s localStorage. No data is sent to a server.', SAMPLE]],
  terms: ['Terms & conditions', ['This demo storefront processes no real orders or payments.', SAMPLE]],
  shipping: ['Shipping & delivery information', ['Delivery ETAs and fees come from configurable mock data: free delivery above ₹499, handling ₹5, small-cart fee under ₹99.', SAMPLE]],
  returns: ['Return & refund policy', ['Report damaged, wrong or missing items from the Returns & refunds tab after delivery. Refund status is simulated.', SAMPLE]],
  careers: ['Careers', ['No open roles — this is a demo page.', SAMPLE]],
  sell: ['Sell on FreshNest', ['Sellers can register and manage listings from the demo seller dashboard.', SAMPLE]],
  cancellation: ['Cancellation & refund policy', ['1. Before packing: free cancellation while the order is in the placed, confirmed or preparing stages.', '2. After packing: cancellation is no longer available; contact support for exceptional issues.', '3. Refunds: eligible prepaid cancellations would return to the original payment method. No real payments are processed in this prototype.', '4. Missing/damaged/wrong items: report via Returns & refunds.', '5. Delivery, handling and gift-packing charges may be treated differently by stage.', SAMPLE]],
};
export default function Info({ slug }) {
  const page = PAGES[slug]; if (!page) return <section className="day3-page"><div className="empty-state"><h3>Page not found</h3><button className="primary" onClick={() => go('/')}>Home</button></div></section>;
  return <section className="day3-page policy-page"><div className="page-topline"><button className="back-link" onClick={() => history.back()}>← Back</button><span className="eyebrow">FRESHNEST</span></div><h1>{page[0]}</h1><div className="panel policy-content">{page[1].map((p, i) => <p key={i}>{p}</p>)}{slug === 'sell' && <button className="primary" onClick={() => go('/seller')}>Open seller demo</button>}{(slug === 'cancellation' || slug === 'returns') && <button className="secondary" onClick={() => go('/support?tab=returns')}>Returns & refunds</button>}</div></section>;
}
export const INFO_LINKS = [['About FreshNest', 'about'], ['Contact us', 'contact'], ['Help centre', 'help'], ['Privacy policy', 'privacy'], ['Terms & conditions', 'terms'], ['Cancellation policy', 'cancellation'], ['Return & refund policy', 'returns'], ['Shipping & delivery', 'shipping'], ['Sell on FreshNest', 'sell'], ['Careers', 'careers']];
