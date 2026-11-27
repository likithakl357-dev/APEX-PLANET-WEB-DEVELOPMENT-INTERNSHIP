import { distanceKm, travelMinutes } from '../../src/lib/distance.js';
const bounded=(value,fallback,min,max)=>{const n=typeof value==='string'&&value.trim()!==''?Number(value):value;return typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max?n:fallback;};
export function deliveryEstimate(groups,address,zone,fees,env=process.env) {
  const central={latitude:bounded(env.FULFILMENT_LAT,null,-90,90),longitude:bounded(env.FULFILMENT_LON,null,-180,180)};
  const distances=groups.map(g=>distanceKm(g.store||central,address));
  const zoneEta=bounded(zone?.eta,null,1,1440);
  if (!distances.length||distances.some(d=>d===null)) return {distanceKm:null,etaMinutes:zoneEta,basis:'zone',deliveryFee:fees.deliveryFee};
  const km=Math.max(...distances); // farthest fulfilment point; not a multi-stop route
  const rate=bounded(env.DELIVERY_PER_KM,0,0,1000);
  const included=bounded(env.DELIVERY_INCLUDED_KM,2,0,1000);
  const speed=bounded(env.DELIVERY_SPEED_KMH,20,5,80);
  const prep=bounded(env.DELIVERY_PREP_MINUTES,10,0,180);
  return {distanceKm:Math.round(km*100)/100,etaMinutes:Math.max(zoneEta||0,Math.ceil(prep+travelMinutes(km,speed))),basis:'straight-line',deliveryFee:Math.min(100000,fees.deliveryFee+Math.ceil(Math.max(0,km-included)*rate))};
}
