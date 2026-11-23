import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, LocateFixed, ChevronLeft } from 'lucide-react';
import { useApp } from '../lib/store.jsx';
import { SERVICE_AREAS } from '../data/config.js';
import { AddressForm } from './AddressManager.jsx';
import { getCurrentPosition, GEO_ERRORS } from '../lib/geolocation.js';
import { reverseGeocode, geocoderName } from '../lib/geocode.js';

const pinStatus = pin => {
  if (!/^\d{6}$/.test(pin || '')) return 'Enter a 6-digit PIN code to check delivery.';
  const s = SERVICE_AREAS.find(x => x.pin === pin);
  return s ? (s.serviceable ? `Deliverable · ~${s.eta} min (demo)` : 'Not serviceable (demo)') : 'PIN not in demo service list — treated as not serviceable';
};

// view: list → (locating → geocoding → confirm | error) | manual
export function LocationModal({ onClose }) {
  const { addresses, selectedAddress, setSelectedAddrId, notify } = useApp();
  const [view, setView] = useState('list');
  const [found, setFound] = useState(null); // { lat, lon, accuracy, geo, geoError }
  const [err, setErr] = useState(null);
  const [pin, setPin] = useState('');
  const run = useRef(0); const ctl = useRef(null);
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => { document.removeEventListener('keydown', k); run.current++; ctl.current?.abort(); }; }, [onClose]);

  const select = a => { setSelectedAddrId(a.id); notify('Delivery location updated'); onClose(); };

  // Runs only from the button click: the browser permission prompt is never triggered in the background.
  const detect = async () => {
    const id = ++run.current; setErr(null); setView('locating');
    try {
      const pos = await getCurrentPosition();
      if (id !== run.current) return;
      setView('geocoding'); ctl.current = new AbortController();
      let geo = null, geoError = '';
      try { geo = await reverseGeocode(pos.lat, pos.lon, { signal: ctl.current.signal }); }
      catch (e) { if (id !== run.current) return; geoError = e?.name === 'AbortError' ? 'The address lookup timed out' : (e?.message || 'Address lookup failed'); }
      if (id !== run.current) return;
      setFound({ ...pos, geo, geoError }); setPin(geo?.pin || ''); setView('confirm');
    } catch (e) {
      if (id !== run.current) return;
      setErr({ ...(GEO_ERRORS[e.code] || GEO_ERRORS.UNKNOWN), code: e.code || 'UNKNOWN' }); setView('error');
    }
  };
  const cancel = () => { run.current++; ctl.current?.abort(); setView('list'); };
  const coords = f => `${f.lat.toFixed(5)}, ${f.lon.toFixed(5)}${f.accuracy ? ` (±${f.accuracy >= 1000 ? (f.accuracy / 1000).toFixed(1) + ' km' : f.accuracy + ' m'})` : ''}`;

  return <div className="overlay" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="address-modal wide-modal" role="dialog" aria-modal="true" aria-label="Choose delivery location">
    <button className="close modal-close" onClick={onClose} aria-label="Close"><X /></button>

    {view === 'list' && <>
      <span className="modal-icon"><MapPin /></span><span className="eyebrow">DELIVERY LOCATION</span><h2>Where should we deliver?</h2>
      <p className="muted">Serviceability and ETA use configurable mock data (demo). Your location is read only when you tap “Use current location”.</p>
      <button className="locate-btn" onClick={detect}><span className="locate-ico"><LocateFixed size={20} /></span><span><b>Use current location</b><small>Detect your address with your browser</small></span></button>
      {addresses.map(a => <button key={a.id} className={`loc-option ${selectedAddress?.id === a.id ? 'selected' : ''}`} onClick={() => select(a)}><b>{a.type}{a.source === 'current-location' && <span className="detected-tag">Detected</span>}</b><span>{a.text}</span><small>{pinStatus(a.pin)}</small></button>)}
      <button className="primary wide" onClick={() => setView('manual')}>Enter a new address manually</button>
    </>}

    {view === 'manual' && <>
      <span className="eyebrow">DELIVERY LOCATION</span><h2>Enter your address</h2>
      <AddressForm onDone={() => setView('list')} onSaved={select} />
    </>}

    {(view === 'locating' || view === 'geocoding') && <div className="locate-status" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <h2>{view === 'locating' ? 'Detecting your location…' : 'Finding your address…'}</h2>
      <p className="muted">{view === 'locating' ? 'If your browser asks, choose “Allow” so FreshNest can read your location.' : `Looking up the address with ${geocoderName()}.`}</p>
      <button className="secondary" onClick={cancel}>Cancel</button>
    </div>}

    {view === 'error' && err && <div className="locate-status error-state" role="alert">
      <span className="modal-icon"><MapPin /></span>
      <h2>{err.title}</h2><p className="muted">{err.message}</p>
      <div className="row-actions center">
        {err.retry && <button className="primary" onClick={detect}>Try again</button>}
        <button className={err.retry ? 'secondary' : 'primary'} onClick={() => setView('manual')}>Enter address manually</button>
      </div>
      <button className="text-button center" onClick={() => setView('list')}>Back to saved addresses</button>
    </div>}

    {view === 'confirm' && found && <>
      <button className="text-button back-link" onClick={() => setView('list')}><ChevronLeft size={16} /> Back</button>
      <span className="eyebrow">CONFIRM ADDRESS</span><h2>Is this where we deliver?</h2>
      {found.geo
        ? <p className="muted">We detected this address from your device’s location. Check it and edit anything that’s off before saving.</p>
        : <p className="notice-warn">We found your location but couldn’t turn it into a street address{found.geoError ? ` (${found.geoError})` : ''}. Please type your address below.</p>}
      <p className="coords">📍 Coordinates: {coords(found)}</p>
      {found.accuracy > 500 && <p className="notice-warn">Your device reports a rough location (about {found.accuracy >= 1000 ? (found.accuracy / 1000).toFixed(1) + ' km' : found.accuracy + ' m'}). Desktop browsers often do this. Please double-check the address.</p>}
      {found.geo?.countryCode && found.geo.countryCode !== 'in' && <p className="notice-warn">This location appears to be outside India ({found.geo.country}); FreshNest’s demo delivery areas are in India.</p>}
      <AddressForm key={`${found.lat},${found.lon}`} submitLabel="Confirm & deliver here" onChange={a => setPin(a.pin)} onDone={() => setView('list')} onSaved={select}
        initial={{ id: '', type: 'Home', text: found.geo?.text || '', pin: found.geo?.pin || '', instructions: '', isDefault: false, lat: found.lat, lon: found.lon, accuracy: found.accuracy, source: 'current-location' }} />
      <p className={`pin-status ${SERVICE_AREAS.find(x => x.pin === pin)?.serviceable ? 'ok' : ''}`}>{pinStatus(pin)}</p>
      <button className="text-button" onClick={detect}>Detect again</button>
      <p className="legal">Your coordinates were sent to {geocoderName()} to look up this address. FreshNest keeps only the address you save.</p>
    </>}
  </div></div>;
}
