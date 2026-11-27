import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { go } from '../lib/store.jsx';
export default function Notifications() {
  const [rows,setRows]=useState(null);
  const [error,setError]=useState('');
  const refresh=()=>api('/notifications').then(setRows).catch(err=>setError(err.message));
  useEffect(()=>{refresh();},[]);
  return <section>
    {error&&<p role="alert">{error}</p>}
    {rows===null&&!error&&<p>Loading updates…</p>}
    {rows?.length===0&&<p>No notifications yet.</p>}
    {rows?.some(row=>!row.readAt)&&<button className="secondary" onClick={async()=>{
      try{await api('/notifications/read',{method:'POST'});await refresh();}catch(err){setError(err.message);}
    }}>Mark all as read</button>}
    {rows?.map(row=><article key={row.id} className="panel">
      <b>{row.title}{!row.readAt && ' · New'}</b>
      <p>{row.message}</p><small>{new Date(row.createdAt).toLocaleString()}</small>
      {row.href&&<button className="text-button" onClick={()=>go(row.href)}>View update</button>}
    </article>)}
  </section>;
}
