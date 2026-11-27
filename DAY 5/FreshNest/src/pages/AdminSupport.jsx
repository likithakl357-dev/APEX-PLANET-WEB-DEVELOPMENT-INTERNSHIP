import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export function AdminSupport() {
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/support/tickets').then(setTickets).catch(error => setError(error.message));
  }, []);

  const save = async (id, data) => {
    await api('/admin/support/tickets/' + id, { method: 'PATCH', body: data });
    setTickets(await api('/admin/support/tickets'));
  };

  return <section className="panel">
    <h2>Support tickets</h2>
    {error && <p className="error" role="alert">{error}</p>}
    {!tickets && !error && <p>Loading tickets…</p>}
    {tickets?.length === 0 && <p>No tickets yet.</p>}
    {tickets?.map(ticket => <Ticket key={ticket.id} ticket={ticket} save={save} />)}
  </section>;
}

function Ticket({ ticket, save }) {
  const [status, setStatus] = useState(ticket.status);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await save(ticket.id, { status, message: message.trim() || undefined });
      setMessage('');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return <article className="panel">
    <h3>{ticket.subject}</h3>
    <p>{ticket.user.name || ticket.user.phone}</p>
    {ticket.messages.map(row => <p key={row.id}>
      <b>{row.senderId === ticket.userId ? 'Customer' : 'Support'} </b>{row.message}
    </p>)}
    <form className="account-info" onSubmit={submit}>
      <label>Status <select value={status} onChange={event => setStatus(event.target.value)}>
        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(value =>
          <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>
        )}
      </select></label>
      <label>Reply<textarea value={message} maxLength={2000} onChange={event => setMessage(event.target.value)} /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={saving}>Save ticket</button>
    </form>
  </article>;
}
