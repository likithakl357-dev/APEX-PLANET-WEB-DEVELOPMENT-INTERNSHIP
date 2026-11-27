import React, { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import DeliveryMap from './DeliveryMap.jsx';
import { getCurrentPosition } from '../lib/geolocation.js';
import { reverseGeocode } from '../lib/geocode.js';
import { useApp } from '../lib/store.jsx';

const blank = { id: '', type: 'Home', text: '', city: 'Chennai', state: 'Tamil Nadu', pin: '', instructions: '', isDefault: false };

export function AddressForm({ initial, onDone, onSaved, onChange, submitLabel = 'Save address' }) {
  const { upsertAddress, notify, configuration } = useApp();
  const [a, setA] = useState(initial ? { ...blank, ...initial, city: initial.city || 'Chennai', state: initial.state || 'Tamil Nadu' } : blank); const [err, setErr] = useState('');
  const set = patch => setA(x => ({ ...x, ...patch }));
  // FRESHNEST_ADDRESS_GPS
  const [locating,setLocating]=useState(false);
  const detectAddress=async()=>{
    setErr('');setLocating(true);
    try{
      const pos=await getCurrentPosition();
      set({lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy});
      try{const geo=await reverseGeocode(pos.lat,pos.lon);set({text:geo.text,city:geo.city,state:geo.state,pin:geo.pin});}
      catch(e){setErr('GPS detected. Address lookup failed: '+e.message+'. Confirm the address manually.');}
    }catch(e){setErr(e.message||'Location unavailable. Allow browser location access.');}
    finally{setLocating(false);}
  };
  useEffect(() => { onChange?.(a); }, [a.pin]); // lets a parent show live serviceability for the PIN being typed
  const submit = async e => {
    e.preventDefault();
    if (a.text.trim().length < 8) return setErr('Please enter a full address (house, street, area).');
    if (!String(a.city || '').trim() || !String(a.state || '').trim()) return setErr('Enter your city and state.');
    if (!/^\d{6}$/.test(a.pin)) return setErr('Enter a valid 6-digit PIN code.');
    const saved = { ...a, text: a.text.trim(), id: a.id || `a${Date.now()}` };
    try { const result = await upsertAddress(saved); notify('Address saved'); onSaved?.(result); onDone?.(); } catch (error) { setErr(error.message); }
  };
  return <form className="addr-form" onSubmit={submit}>
    <div className="type-row">{['Home', 'Work', 'Other'].map(t => <button type="button" key={t} className={a.type === t ? 'chosen' : ''} onClick={() => set({ type: t })}>{t}</button>)}</div>
    <label className="field-label">FULL ADDRESS</label><textarea rows="2" value={a.text} onChange={e => set({ text: e.target.value })} placeholder="Flat / house no., street, area, landmark" />
    <label className="field-label">CITY</label><input value={a.city || ''} onChange={e => set({ city: e.target.value })} placeholder="City" />
    <label className="field-label">STATE</label><input value={a.state || ''} onChange={e => set({ state: e.target.value })} placeholder="State" />
    <label className="field-label">PIN CODE</label><input inputMode="numeric" maxLength={6} value={a.pin} onChange={e => set({ pin: e.target.value.replace(/\D/g, '') })} placeholder="6-digit PIN" list="pins" /><datalist id="pins">{configuration.serviceAreas.map(s => <option key={s.pin} value={s.pin}>{s.area}</option>)}</datalist>
    <button type="button" className="secondary" disabled={locating} onClick={detectAddress}>{locating?'Finding your address…':'Use current GPS location'}</button>
    <DeliveryMap destination={{latitude:a.lat,longitude:a.lon}} accuracy={a.accuracy} onPick={p=>set({lat:p.latitude,lon:p.longitude,accuracy:null})}/>
    {Number.isFinite(a.lat)&&Number.isFinite(a.lon)&&<small className="muted">Saved pin on submission: {a.lat.toFixed(5)}, {a.lon.toFixed(5)}. Check that the pin matches your address.</small>}
    <label className="field-label" htmlFor="delivery-phone">Delivery phone (optional)</label>
    <input id="delivery-phone" type="tel" autoComplete="tel" value={a.phone || ''} maxLength={15}
      onChange={event => set({ phone: event.target.value })} placeholder="Phone number for delivery" />
    <label className="field-label">DELIVERY INSTRUCTIONS (OPTIONAL)</label><input value={a.instructions} onChange={e => set({ instructions: e.target.value })} placeholder="E.g. Ring the bell twice" />
    <label className="check"><input type="checkbox" checked={a.isDefault} onChange={e => set({ isDefault: e.target.checked })} /> Make this my default address</label>
    {err && <p className="error">{err}</p>}
    <div className="row-actions"><button className="primary" type="submit">{submitLabel}</button>{onDone && <button type="button" className="secondary" onClick={onDone}>Cancel</button>}</div>
  </form>;
}

export function AddressList({ selectable }) {
  const { addresses, deleteAddress, selectedAddress, setSelectedAddrId, notify } = useApp();
  const [editing, setEditing] = useState(null);
  return <div className="addr-list">
    {addresses.length === 0 && <p className="muted">No saved addresses yet.</p>}
    {addresses.map(a => editing === a.id ? <div className="addr-card" key={a.id}><AddressForm initial={a} onDone={() => setEditing(null)} /></div> :
      <div className={`addr-card ${selectable && selectedAddress?.id === a.id ? 'selected' : ''}`} key={a.id}>
        {selectable && <input type="radio" name="addr" aria-label={`Deliver to ${a.type}`} checked={selectedAddress?.id === a.id} onChange={() => setSelectedAddrId(a.id)} />}
        <div className="addr-body"><b>{a.type}{a.isDefault && <span className="tag-default">Default</span>}</b><p>{[a.text, a.city, a.state].filter(Boolean).join(', ')}</p><small className="muted">PIN {a.pin}{a.instructions ? ` · ${a.instructions}` : ''}</small></div>
        <button className="icon-btn" aria-label="Edit address" onClick={() => setEditing(a.id)}><Pencil size={15} /></button>
        <button className="icon-btn" aria-label="Delete address" onClick={async () => { if (confirm('Delete this address?')) { try { await deleteAddress(a.id); notify('Address deleted'); } catch(e) { notify(e.message); } } }}><Trash2 size={15} /></button>
      </div>)}
    {editing === 'new' ? <div className="addr-card"><AddressForm onDone={() => setEditing(null)} /></div> : <button className="secondary" onClick={() => setEditing('new')}>+ Add new address</button>}
  </div>;
}
