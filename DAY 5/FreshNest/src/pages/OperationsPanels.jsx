import React, { useEffect, useState } from 'react';
import DeliveryMap from '../components/DeliveryMap.jsx';
import { api } from '../lib/api.js';
import { useApp } from '../lib/store.jsx';
import { money } from '../lib/money.js';
import { products } from '../data/products.js';

const optionalNumber=(data,key)=>data.get(key)===''?null:Number(data.get(key));
const fields={freeDeliveryAbove:'Free delivery threshold',deliveryFee:'Standard delivery',handling:'Handling charge',
  smallCartBelow:'Small-basket threshold',smallCartFee:'Small-basket fee',giftPacking:'Gift packing',minOrder:'Minimum order'};

function useWorkspace(load) {
  const [data,setData]=useState(null);
  const [notice,setNotice]=useState('');
  const [busy,setBusy]=useState(false);
  const refresh=()=>load().then(setData).catch(error=>setNotice(error.message));
  useEffect(()=>{refresh();},[]);
  const save=async task=>{
    if(busy)return;
    setBusy(true);
    setNotice('');
    try {await task();await refresh();setNotice('Changes saved.');}
    catch(error){setNotice(error.message);}
    finally{setBusy(false);}
  };
  return {data,notice,busy,save};
}
const submit = callback => event => { event.preventDefault(); callback(new FormData(event.currentTarget)); };

function ZoneForm({zone,busy,save}) {
  return <form className="panel ops-form" onSubmit={submit(data=>save(data.get('pin'),{
    area:data.get('area'),eta:optionalNumber(data,'eta'),serviceable:data.get('serviceable')==='on',
    deliveryFee:optionalNumber(data,'deliveryFee')
  }))}>
    <label>PIN <input name="pin" defaultValue={zone?.pin} readOnly={!!zone} pattern="[0-9]{6}" required /></label>
    <label>Area <input name="area" defaultValue={zone?.area} required /></label>
    <label>ETA in minutes <input name="eta" type="number" min="1" defaultValue={zone?.eta??''} /></label>
    <label>Delivery fee override <input name="deliveryFee" type="number" min="0" defaultValue={zone?.deliveryFee??''} /></label>
    <label><input type="checkbox" name="serviceable" defaultChecked={zone?.serviceable??true} /> Delivery available</label>
    <button className="secondary" disabled={busy}>{zone?'Save zone':'Add zone'}</button>
  </form>;
}

export function DeliverySettings() {
  const {refreshConfig}=useApp();
  const {data,busy,notice,save}=useWorkspace(()=>api('/config'));
  const updateZone=(pin,body)=>save(async()=>{await api('/admin/delivery-zones/'+encodeURIComponent(pin),{method:'PUT',body});await refreshConfig();});
  return <section>
    {notice && <p role="status">{notice}</p>}
    <h2>Delivery pricing</h2>
    {data && <form className="panel ops-form" onSubmit={submit(values=>save(async()=>{
      const body=Object.fromEntries(Object.keys(fields).map(key=>[key,Number(values.get(key))]));
      await api('/admin/delivery-pricing',{method:'PUT',body});
      await refreshConfig();
    }))}>
      {Object.entries(fields).map(([key,label])=><label key={key}>{label} (₹)
        <input name={key} type="number" min="0" required defaultValue={data.fees[key]} />
      </label>)}
      <button className="primary" disabled={busy}>Save pricing</button>
    </form>}
    <h2>Delivery zones</h2>
    <ZoneForm busy={busy} save={updateZone} />
    {data?.serviceAreas.map(zone=><ZoneForm key={zone.pin} zone={zone} busy={busy} save={updateZone}/>)}
  </section>;
}
export function StoreApproval() {
  const {data,notice,busy,save}=useWorkspace(()=>Promise.all([api('/admin/stores'),api('/admin/store-orders')]));
  const [stores,settlements]=data||[[],[]];
  return <section className="panel"><h2>Store approval</h2>{notice&&<p role="status">{notice}</p>}
    {stores.length===0&&<p>No store applications yet.</p>}
    {stores.map(store=><form key={store.id} className="ops-form" onSubmit={submit(values=>save(()=>api('/admin/stores/'+store.id,{
      method:'PATCH',body:{active:values.get('active')==='on',commissionBps:Math.round(Number(values.get('commission'))*100)}
    })))}>
      <strong>{store.name} · {store.seller.storeName}</strong>
      <p>{store.address} · {store.pins.join(', ')}</p>
      <label><input type="checkbox" name="active" defaultChecked={store.active} /> Approve for fulfilment</label>
      <label>Commission (%) <input name="commission" type="number" min="0" max="100" step="0.01" defaultValue={store.commissionBps/100} required/></label>
      <button className="secondary" disabled={busy}>Save store</button>
    </form>)}
    <h3>Seller settlements</h3>
    {settlements.map(row=><article className="account-order col" key={row.id}>
      <b>{row.store.name} · {row.order.orderNumber}</b>
      <p>Commission {money(row.commission)} · {row.settledAt ? 'Recorded ' + money(row.settledAmount) : 'Net before refunds ' + money(row.net)}</p>
      {!row.settledAt && row.order.status==='DELIVERED' && row.order.paymentStatus==='PAID' &&
        <button className="secondary" disabled={busy} onClick={()=>{
          const reference=prompt('Reference for the externally verified settlement');
          if(reference?.trim().length>=5)save(()=>api('/admin/store-orders/'+row.id+'/settlement',{method:'POST',body:{reference}}));
        }}>Record verified settlement</button>}
    </article>)}
  </section>;
}
function ListingEditor({store,listing,busy,save}) {
  return <form className="ops-form" onSubmit={submit(values=>save(()=>api(
    '/seller/stores/'+store.id+'/listings/'+encodeURIComponent(values.get('product')), {method:'PUT',body:{
      price:Number(values.get('price')),stock:Number(values.get('stock')),active:values.get('active')==='on'
    }}
  )))}>
    {listing?<><b>{listing.product.name}</b><input type="hidden" name="product" value={listing.productId}/></>:<label>Product
      <select name="product" required defaultValue=""><option value="" disabled>Choose product</option>
      {products.filter(p=>!store.listings.some(l=>l.productId===p.id)).map(p=><option key={p.id} value={p.id}>{p.name} · {p.brand}</option>)}</select>
    </label>}
    <label>Price (₹) <input name="price" type="number" min="1" required defaultValue={listing?.price}/></label>
    <label>Units in stock <input key={listing?.stock} name="stock" type="number" min="0" required defaultValue={listing?.stock}/></label>
    <label><input name="active" type="checkbox" defaultChecked={listing?.active??true}/> Available</label>
    <button className="secondary" disabled={busy}>{listing?'Update listing':'Add listing'}</button>
  </form>;
}
export function SellerStores() {
  const {data,notice,busy,save}=useWorkspace(async()=>Promise.all([api('/seller/stores'),api('/seller/fulfilment')]));
  const [stores,orders]=data||[[],[]];
  const [storePin,setStorePin]=useState({latitude:null,longitude:null});
  return <section>
    <h2>Independent stores</h2>
    {notice&&<p role="status">{notice}</p>}
    <form className="panel ops-form" onSubmit={submit(values=>save(()=>api('/seller/stores',{method:'POST',body:{
      name:values.get('name'),address:values.get('address'),pins:values.get('pins').split(/[\s,]+/).filter(Boolean),
      minOrder:Number(values.get('minOrder')),latitude:optionalNumber(values,'latitude'),
      longitude:optionalNumber(values,'longitude'),radiusKm:optionalNumber(values,'radiusKm')
    }})))}>
      <label>Store name <input name="name" required /></label><label>Pickup address <input name="address" required /></label>
      <label>Delivery PINs <input name="pins" placeholder="600001, 600020" required /></label>
      <label>Minimum order (₹) <input name="minOrder" type="number" min="0" required defaultValue="0" /></label>
      <label>Latitude <input name="latitude" type="number" step="any" min="-90" max="90" value={storePin.latitude??''} onChange={e=>setStorePin(p=>({...p,latitude:e.target.value===''?null:Number(e.target.value)}))}/></label>
      <label>Longitude <input name="longitude" type="number" step="any" min="-180" max="180" value={storePin.longitude??''} onChange={e=>setStorePin(p=>({...p,longitude:e.target.value===''?null:Number(e.target.value)}))}/></label>
      <DeliveryMap destination={storePin} onPick={setStorePin} label="Store pickup location"/>
      <label>Radius (km) <input name="radiusKm" type="number" step="any" min="0" /></label>
      <button className="primary" disabled={busy}>Request store approval</button>
    </form>
    {stores.map(store=><section className="panel" key={store.id}><h3>{store.name}</h3>
      <p>{store.active?'Active':'Pending approval or suspended'}</p>
      <ListingEditor store={store} busy={busy} save={save} />
      {store.listings.map(listing=><ListingEditor key={listing.id} store={store} listing={listing} busy={busy} save={save}/>)}
    </section>)}
    <section className="panel"><h2>Orders to fulfil</h2>
      {!orders.length&&<p>No store orders yet.</p>}
      {orders.map(row=>{
        const next={PENDING:'ACCEPTED',ACCEPTED:'PICKING',PICKING:'PACKED'}[row.status];
        return <article className="account-order col" key={row.id}>
          <b>{row.store.name} · {row.order.orderNumber} · {row.status.toLowerCase()}</b>
          <p>{row.items.map(item=>item.productName+' × '+item.quantity).join(', ')}</p>
          <p>Subtotal {money(row.subtotal)} · Discount {money(row.discount)} · Commission {money(row.commission)} · Net before refunds {money(row.net)}</p>
          {next && (row.order.paymentMethod==='COD'||row.order.paymentStatus==='PAID') &&
            <button className="secondary" disabled={busy} onClick={()=>save(()=>api('/seller/fulfilment/'+row.id,{method:'PATCH',body:{status:next}}))}>{next.toLowerCase()}</button>}
        </article>;
      })}
    </section>
  </section>;
}

export function DeliveryConfirmation({id,mutate}) {
  const [code,setCode]=useState('');
  return <form className="row-actions" onSubmit={event=>{event.preventDefault();mutate('/delivery/assignments/'+id+'/confirm','POST',{code});}}>
    <label>Customer delivery code <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code}
      onChange={event=>setCode(event.target.value.replace(/\D/g,''))} required/></label>
    <button className="primary" disabled={code.length!==6}>Confirm delivery</button>
  </form>;
}

export function DriverAvailability() {
  const {data,notice,busy,save}=useWorkspace(()=>api('/delivery/availability'));
  return <div className="panel"><h3>Delivery availability</h3>
    {notice&&<p role="status">{notice}</p>}
    {data&&<label><input type="checkbox" checked={data.available} disabled={busy}
      onChange={event=>{const available=event.target.checked;save(()=>api('/delivery/availability',{method:'PUT',body:{available}}));}}/> Available for new deliveries</label>}
  </div>;
}

export function DeliveryGps({id,destination,initialPartner}) {
  const [enabled,setEnabled]=useState(false);
  const [error,setError]=useState('');
  const [reported,setReported]=useState(null);
  useEffect(()=>{
    if(!enabled||!navigator.geolocation)return;
    let active=true, pending=false, latest=null, last=0;
    const send=()=>{
      if(!active||pending||!latest||Date.now()-latest.timestamp>45000||Date.now()-last<15000)return;
      pending=true;last=Date.now();
      const {latitude,longitude}=latest.coords;
      api('/delivery/assignments/'+id+'/location',{method:'POST',body:{latitude,longitude}})
        .then(row=>{if(active){setError('');setReported(row);}}).catch(err=>{if(active){setError(err.message);if([401,403,404,409].includes(err.status))setEnabled(false);}}).finally(()=>{pending=false;});
    };
    const watcher=navigator.geolocation.watchPosition(position=>{latest=position;send();},err=>{if(active){setError(err.message);setEnabled(false);}},{enableHighAccuracy:true,maximumAge:15000,timeout:20000});
    const timer=setInterval(()=>{if(active&&!pending&&(!latest||Date.now()-latest.timestamp>30000))navigator.geolocation.getCurrentPosition(p=>{if(active){latest=p;send();}},()=>{}, {maximumAge:15000,timeout:10000});else send();},15000);
    return ()=>{active=false;clearInterval(timer);navigator.geolocation.clearWatch(watcher);};
  },[enabled,id]);
  return <div className="row-actions">
    {navigator.geolocation&&<label><input type="checkbox" checked={enabled}
      onChange={event=>{setError('');setEnabled(event.target.checked);}}/> Share delivery location while this page stays open</label>}
    {error&&<p role="alert">{error}</p>}
    <DeliveryMap destination={destination} partner={reported||initialPartner}/>
  </div>;
}

function CouponForm({row,busy,save}) {
  return <form className="panel ops-form" onSubmit={submit(data=>save(()=>api('/admin/coupons/'+encodeURIComponent(data.get('code')),{
    method:'PUT',body:{type:data.get('type'),value:Number(data.get('value')),minOrder:Number(data.get('minOrder')),
      maxDiscount:optionalNumber(data,'maxDiscount'),usageLimit:optionalNumber(data,'usageLimit'),active:data.get('active')==='on',
      startsAt:data.get('startsAt')?new Date(data.get('startsAt')).toISOString():null,
      expiresAt:data.get('expiresAt')?new Date(data.get('expiresAt')).toISOString():null}
  })))}>
    <label>Code <input name="code" defaultValue={row?.code} readOnly={!!row} required /></label>
    <label>Discount type <select name="type" defaultValue={row?.type||'FLAT'}><option value="FLAT">Fixed amount</option>
      <option value="PERCENT">Percentage</option><option value="FREE_DELIVERY">Free delivery</option></select></label>
    <label>Value (0 for free delivery) <input type="number" name="value" min="0" required defaultValue={row?.value??0}/></label>
    <label>Minimum order <input type="number" name="minOrder" min="0" required defaultValue={row?.minOrder??0}/></label>
    <label>Maximum discount <input type="number" name="maxDiscount" min="1" defaultValue={row?.maxDiscount??''}/></label>
    <label>Usage limit <input type="number" name="usageLimit" min="1" defaultValue={row?.usageLimit??''}/></label>
    <label>Start time (browser time zone) <input type="datetime-local" name="startsAt" defaultValue={localTime(row?.startsAt)} /></label>
    <label>End time (browser time zone) <input type="datetime-local" name="expiresAt" defaultValue={localTime(row?.expiresAt)} /></label>
    <label><input type="checkbox" name="active" defaultChecked={row?.active??true} /> Active</label>
    <button className="secondary" disabled={busy}>{row?'Save coupon':'Create coupon'}</button>
  </form>;
}
function localTime(value) {
  if(!value)return '';
  const date=new Date(value);
  return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}
export function CouponManagement() {
  const { data,notice,busy,save }=useWorkspace(()=>api('/admin/coupons'));
  return <section><h2>Coupons</h2>{notice&&<p role="status">{notice}</p>}
    <CouponForm busy={busy} save={save}/>
    {data?.map(row=><CouponForm key={row.code} row={row} busy={busy} save={save}/>)}
  </section>;
}

export function RefundRequest({order,mutate}) {
  const [requestKey,setRequestKey]=useState(null);
  return <details><summary>Request refund</summary>
    <form className="ops-form" onChange={()=>setRequestKey(null)} onSubmit={async event=>{
      event.preventDefault();
      const data=new FormData(event.currentTarget);
      const key=requestKey||crypto.randomUUID();
      setRequestKey(key);
      await mutate('/admin/orders/'+order.id+'/refund-request','POST',{
        amount:Number(data.get('amount')),reason:data.get('reason'),requestKey:key,
        orderItemId:data.get('item')||undefined
      });
    }}>
      <label>Scope <select name="item"><option value="">Order adjustment</option>
        {order.items.map(item=><option key={item.id} value={item.id}>{item.productName} × {item.quantity}</option>)}
      </select></label>
      <label>Refund (₹) <input name="amount" required type="number" min="1" max={order.total} /></label>
      <label>Reason <input name="reason" required minLength="5" maxLength="400" /></label>
      <button className="secondary">Save request</button>
    </form>
  </details>;
}
