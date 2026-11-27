import React, {useEffect,useRef,useState} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {validPoint} from '../lib/distance.js';
import './delivery-map.css';

export default function DeliveryMap({destination,partner,onPick,accuracy,label='Delivery address'}) {
  const el=useRef(null), map=useRef(null), layer=useRef(null), pick=useRef(onPick), first=useRef(true);
  const [shown,setShown]=useState(false),[error,setError]=useState(false);
  pick.current=onPick;
  const lat=destination?.latitude,lon=destination?.longitude,plat=partner?.latitude,plon=partner?.longitude;
  useEffect(()=>{
    if(!shown||!el.current)return;
    const m=L.map(el.current,{scrollWheelZoom:false}).setView([13.0827,80.2707],12);
    map.current=m;first.current=true;
    const tiles=L.tileLayer(import.meta.env.VITE_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:import.meta.env.VITE_MAP_ATTRIBUTION||'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19
    }).addTo(m);
    tiles.on('tileerror',()=>setError(true));tiles.on('tileload',()=>setError(false));
    layer.current=L.layerGroup().addTo(m);
    m.on('click',e=>pick.current?.({latitude:e.latlng.lat,longitude:e.latlng.lng}));
    return()=>{m.remove();map.current=null;layer.current=null;};
  },[shown]);
  useEffect(()=>{
    if(!shown||!map.current||!layer.current)return;
    const group=layer.current;group.clearLayers();
    const points=[];
    const add=(p,label,color)=>{if(!validPoint(p))return;const xy=[p.latitude,p.longitude];points.push(xy);L.circleMarker(xy,{radius:9,color:'#fff',weight:3,fillColor:color,fillOpacity:1}).bindTooltip(label,{permanent:true,direction:'top'}).addTo(group);};
    add({latitude:lat,longitude:lon},label,'#216543');
    add({latitude:plat,longitude:plon},'Delivery partner','#1769aa');
    if(validPoint({latitude:lat,longitude:lon})&&Number.isFinite(accuracy)&&accuracy>0)L.circle([lat,lon],{radius:accuracy,color:'#216543',weight:1,fillOpacity:.08}).addTo(group);
    if(first.current||onPick||points.length>1){if(points.length===1)map.current.setView(points[0],16);else if(points.length>1)map.current.fitBounds(points,{padding:[35,35],maxZoom:16});first.current=false;}
  },[shown,lat,lon,plat,plon,accuracy,label,Boolean(onPick)]);
  return <div className="fn-map-block">
    <button type="button" className="secondary" onClick={()=>{setError(false);setShown(v=>!v);}}>{shown?'Hide map':onPick?'Choose location on map':'Show delivery map'}</button>
    {shown&&<><p className="muted">{onPick?'Tap the map to place your location pin. Confirm the street address before saving.':'Reported GPS positions, not a navigable route.'} Map tiles are loaded from an external map provider.</p><div ref={el} className="fn-leaflet-map" aria-label={onPick?'Choose location on map':'Delivery tracking map'}/>{error&&<p role="status" className="muted">Map tiles may be unavailable. Your saved coordinates and address are still usable.</p>}</>}
  </div>;
}
