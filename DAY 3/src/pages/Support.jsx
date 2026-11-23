import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useApp, go, stageOf } from '../lib/store.jsx';

const FAQ = [['How fast is delivery?', 'Delivery time depends on your area. The ETA shown is demo data from configurable settings.'], ['How do I cancel an order?', 'Open the order from My orders. Cancellation is allowed only before packing starts (sample policy).'], ['What if an item is missing or damaged?', 'Open Returns & refunds, pick the order and issue type, and submit the request.'], ['Payment failed — am I charged?', 'In this demo no payment is ever taken. In production the gateway’s rules would apply.'], ['How do refunds work?', 'Refund status is simulated here. The final policy will be defined before launch.']];
const BOT = [[/cancel/i, 'You can cancel from My orders → Cancel while the order is not yet packed.'], [/refund|money/i, 'Eligible refunds go to the original payment method (demo statement; nothing is actually refunded).'], [/missing|damag|wrong/i, 'Sorry about that! Use the Returns & refunds tab to report it with photos.'], [/late|delay|where/i, 'Track your order from My orders to see the simulated status.'], [/pay/i, 'Payments are simulated in this demo; no real charge happens.']];
const ISSUES = ['Delivery issue', 'Payment issue', 'Refund issue', 'Missing product', 'Damaged product', 'Wrong product', 'Cancellation question', 'Other'];

export default function Support() {
  const { route } = useApp(); const [tab, setTab] = useState(route.params.tab || 'faq');
  const tabs = [['faq', 'FAQs'], ['ticket', 'Create ticket'], ['tickets', 'My tickets'], ['returns', 'Returns & refunds'], ['chat', 'Chat']];
  return <section className="day3-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back</button><span className="eyebrow">HELP CENTRE</span></div><div className="page-title"><div><h1>Customer support</h1><p>Demo support — automated replies are demonstrations until a real support service is connected.</p></div></div>
    <div className="type-row wrap">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'chosen' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === 'faq' && <div className="panel">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}<p className="muted">Contact: support@freshnest.demo · 8 AM – 10 PM (demo)</p></div>}
    {tab === 'ticket' && <Ticket onDone={() => setTab('tickets')} />}{tab === 'tickets' && <Tickets />}{tab === 'returns' && <Returns />}{tab === 'chat' && <Chat />}</section>;
}

function Ticket({ onDone, preset }) {
  const { orders, tickets, setTickets, notify } = useApp(); const [f, setF] = useState({ issue: ISSUES[0], order: '', text: '' }); const [err, setErr] = useState('');
  const submit = e => { e.preventDefault(); if (f.text.trim().length < 10) return setErr('Please describe the problem (at least 10 characters).'); setTickets([{ id: `T${Date.now().toString().slice(-6)}`, ...f, status: 'Open (demo)', created: new Date().toLocaleString('en-IN'), type: 'ticket' }, ...tickets]); notify('Ticket created'); onDone(); };
  return <form className="panel account-info" onSubmit={submit}><label className="field-label">ISSUE TYPE</label><select value={f.issue} onChange={e => setF({ ...f, issue: e.target.value })}>{ISSUES.map(i => <option key={i}>{i}</option>)}</select><label className="field-label">ORDER (OPTIONAL)</label><select value={f.order} onChange={e => setF({ ...f, order: e.target.value })}><option value="">Not about a specific order</option>{orders.map(o => <option key={o.id} value={o.id}>#{o.id}</option>)}</select><label className="field-label">DESCRIBE THE PROBLEM</label><textarea rows={4} value={f.text} onChange={e => setF({ ...f, text: e.target.value })} />{err && <p className="error">{err}</p>}<button className="primary" type="submit">Submit ticket</button></form>;
}
function Tickets() { const { tickets } = useApp(); return <div className="panel">{tickets.filter(t => t.type !== 'return').length === 0 ? <p className="muted">No tickets yet.</p> : tickets.filter(t => t.type !== 'return').map(t => <div className="account-order" key={t.id}><div><b>{t.issue}</b><small>#{t.id} · {t.created}{t.order ? ` · Order ${t.order}` : ''}</small><small>{t.text}</small></div><span className="secure-pill">{t.status}</span></div>)}</div>; }

function Returns() {
  const { orders, tickets, setTickets, notify } = useApp(); const eligible = orders.filter(o => o.status !== 'cancelled' && stageOf(o) === 6);
  const [f, setF] = useState({ order: '', kind: 'Damaged product', item: '', file: '', text: '' }); const [err, setErr] = useState('');
  const o = eligible.find(x => x.id === f.order);
  const submit = e => { e.preventDefault(); if (!o) return setErr('Select a delivered order. (Only delivered orders can be returned — in this demo, wait about 80 seconds after ordering.)'); if (!f.item) return setErr('Select the affected item.'); if (f.text.trim().length < 5) return setErr('Add a short description.'); setTickets([{ id: `R${Date.now().toString().slice(-6)}`, type: 'return', issue: f.kind, order: f.order, item: f.item, evidence: f.file || 'No file', text: f.text, status: 'Under review (demo refund pending)', created: new Date().toLocaleString('en-IN') }, ...tickets]); setErr(''); notify('Request submitted'); setF({ order: '', kind: 'Damaged product', item: '', file: '', text: '' }); };
  const hist = tickets.filter(t => t.type === 'return');
  return <><form className="panel account-info" onSubmit={submit}><p className="muted">Sample return rules: report within 24 hours of delivery. Not legally approved wording.</p><label className="field-label">DELIVERED ORDER</label><select value={f.order} onChange={e => setF({ ...f, order: e.target.value, item: '' })}><option value="">{eligible.length ? 'Select order' : 'No delivered orders yet'}</option>{eligible.map(x => <option key={x.id} value={x.id}>#{x.id}</option>)}</select>
    <label className="field-label">ISSUE</label><select value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>{['Damaged product', 'Wrong item', 'Missing item', 'Replacement request', 'Return request'].map(k => <option key={k}>{k}</option>)}</select>
    <label className="field-label">ITEM</label><select value={f.item} onChange={e => setF({ ...f, item: e.target.value })}><option value="">Select item</option>{o?.items.map(i => <option key={i.id}>{i.name}</option>)}</select>
    <label className="field-label">EVIDENCE (PHOTO — NOT UPLOADED IN DEMO)</label><input type="file" accept="image/*" onChange={e => setF({ ...f, file: e.target.files[0]?.name || '' })} /><label className="field-label">DETAILS</label><textarea rows={3} value={f.text} onChange={e => setF({ ...f, text: e.target.value })} />{err && <p className="error">{err}</p>}<button className="primary" type="submit">Submit request</button></form>
    <div className="panel"><h2>Return history</h2>{hist.length === 0 ? <p className="muted">No requests yet.</p> : hist.map(t => <div className="account-order" key={t.id}><div><b>{t.issue} — {t.item}</b><small>#{t.id} · Order {t.order} · {t.created}</small></div><span className="secure-pill">{t.status}</span></div>)}</div></>;
}

function Chat() {
  const [msgs, setMsgs] = useState([{ from: 'bot', t: 'Hi! I’m a demo assistant with canned replies. Ask about cancellations, refunds, or missing items.' }]); const [v, setV] = useState('');
  const send = e => { e.preventDefault(); const t = v.trim(); if (!t) return; const reply = (BOT.find(([r]) => r.test(t)) || [0, 'I can’t answer that in demo mode. Please create a support ticket.'])[1]; setMsgs(m => [...m, { from: 'me', t }, { from: 'bot', t: reply }]); setV(''); };
  return <div className="panel chat"><div className="chat-log">{msgs.map((m, i) => <p key={i} className={m.from}>{m.t}</p>)}</div><form className="chat-form" onSubmit={send}><input value={v} onChange={e => setV(e.target.value)} placeholder="Type your question" aria-label="Chat message" /><button className="primary" type="submit"><Send size={15} /></button></form><small className="muted">Automated demo responses only; no real agent.</small></div>;
}
