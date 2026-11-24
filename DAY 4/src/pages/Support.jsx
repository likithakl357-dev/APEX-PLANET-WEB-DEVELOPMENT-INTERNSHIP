import { api } from '../lib/api.js';
import React, { useState, useEffect } from 'react';

import { useApp, go } from '../lib/store.jsx';

const FAQ = [
  ['How fast is delivery?', 'Check your delivery PIN to see an estimated delivery time.'],
  ['How do I cancel an order?', 'Use My orders to cancel a pending or confirmed order.'],
  ['What if an item is missing or damaged?', 'Create a support ticket and include the order number and affected items.'],
  ['How do I pay?', 'Pay in cash when your order is delivered.'],
  ['How do refunds work?', 'Check Returns & refunds for the status of your request.']
];
const ISSUES = ['Delivery issue', 'Payment issue', 'Refund issue', 'Missing product', 'Damaged product', 'Wrong product', 'Cancellation question', 'Other'];

export default function Support() {
  const { route } = useApp(); const [tab, setTab] = useState(route.params.tab || 'faq');
  const tabs = [['faq', 'FAQs'], ['ticket', 'Create ticket'], ['tickets', 'My tickets'], ['returns', 'Returns & refunds']];
  return <section className="day3-page"><div className="page-topline"><button className="back-link" onClick={() => go('/')}>← Back</button><span className="eyebrow">HELP CENTRE</span></div><div className="page-title"><div><h1>Customer support</h1><p>Find answers, report an order problem, or follow an existing request.</p></div></div>
    <div className="type-row wrap">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'chosen' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === 'faq' && <div className="panel">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>}
    {tab === 'ticket' && <Ticket onDone={() => setTab('tickets')} />}{tab === 'tickets' && <Tickets />}{tab === 'returns' && <Returns />}</section>;
}

function Ticket({ onDone, preset }) {
  const { orders, tickets, setTickets, notify } = useApp(); const [f, setF] = useState({ issue: ISSUES[0], order: '', text: '' }); const [err, setErr] = useState('');
  const submit=async e=>{e.preventDefault();if(f.text.trim().length<10)return setErr('Describe the problem (at least 10 characters).');try{await api('/support/tickets',{method:'POST',body:{subject:f.issue,message:[f.order?`Order ${f.order}:`:'',f.text].join(' ')}});notify('Ticket created');onDone();}catch(e){setErr(e.message);}};
  return <form className="panel account-info" onSubmit={submit}><label className="field-label">ISSUE TYPE</label><select value={f.issue} onChange={e => setF({ ...f, issue: e.target.value })}>{ISSUES.map(i => <option key={i}>{i}</option>)}</select><label className="field-label">ORDER (OPTIONAL)</label><select value={f.order} onChange={e => setF({ ...f, order: e.target.value })}><option value="">Not about a specific order</option>{orders.map(o => <option key={o.id} value={o.id}>#{o.id}</option>)}</select><label className="field-label">DESCRIBE THE PROBLEM</label><textarea rows={4} value={f.text} onChange={e => setF({ ...f, text: e.target.value })} />{err && <p className="error">{err}</p>}<button className="primary" type="submit">Submit ticket</button></form>;
}
function Tickets() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const reload = async () => setRows(await api('/support/tickets'));
  useEffect(() => { reload().catch(error => setError(error.message)); }, []);
  return <div className="panel">
    {error && <p className="error" role="alert">{error}</p>}
    {!rows && !error && <p>Loading tickets…</p>}
    {rows?.length === 0 && <p>No tickets yet.</p>}
    {rows?.map(ticket => <TicketThread key={ticket.id} ticket={ticket} reload={reload} />)}
  </div>;
}

function TicketThread({ ticket, reload }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const reply = async event => {
    event.preventDefault();
    setSending(true);
    setError('');
    try {
      await api('/support/tickets/' + ticket.id + '/messages', {
        method: 'POST', body: { message: message.trim() }
      });
      setMessage('');
      await reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setSending(false);
    }
  };
  return <article className="panel">
    <h3>{ticket.subject}</h3>
    <p>{ticket.status.replaceAll('_', ' ')}</p>
    {ticket.messages.map(row => <p key={row.id}>
      <b>{row.senderId === ticket.userId ? 'You' : 'Support'} </b>{row.message}
    </p>)}
    {ticket.status !== 'CLOSED' && <form className="account-info" onSubmit={reply}>
      <label>Reply<textarea value={message} onChange={event => setMessage(event.target.value)} maxLength={2000} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="secondary" disabled={sending || message.trim().length < 2}>Send reply</button>
    </form>}
  </article>;
}

function Returns(){const {orders,refreshOrders,notify}=useApp();const [order,setOrder]=useState(''),[reason,setReason]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);const eligible=orders.filter(o=>o.status==='delivered'&&!o.returns.some(r=>r.status!=='REJECTED'));const submit=async e=>{e.preventDefault();if(busy)return;setBusy(true);try{await api(`/orders/${order}/returns`,{method:'POST',body:{reason}});await refreshOrders();setOrder('');setReason('');setErr('');notify('Return request submitted');}catch(e){setErr(e.message);}finally{setBusy(false);}};return <><form className="panel account-info" onSubmit={submit}><p>Request a whole-order return for a delivered order. Follow the status of your request below.</p><label className="field-label">DELIVERED ORDER</label><select required value={order} onChange={e=>setOrder(e.target.value)}><option value="">Select order</option>{eligible.map(o=><option key={o.id}>{o.id}</option>)}</select><label className="field-label">REASON</label><textarea required minLength={5} maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/>{err&&<p className="error">{err}</p>}<button className="primary" disabled={busy}>Submit request</button></form><div className="panel"><h2>Return history</h2>{orders.flatMap(o=>o.returns.map(r=><div className="account-order" key={r.id}><div><b>{o.id} · {r.status}</b><p>{r.reason}</p></div></div>))}{orders.flatMap(o=>o.refunds.map(r=><p key={r.id}>{o.id} · Refund ₹{r.amount} · {r.status}</p>))}</div></>}

