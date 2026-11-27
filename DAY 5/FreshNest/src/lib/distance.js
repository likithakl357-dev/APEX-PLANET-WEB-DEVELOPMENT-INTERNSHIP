// Straight-line distances only; not turn-by-turn road routing.
export const validPoint = p => Boolean(p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude)<=90 && Math.abs(p.longitude)<=180);
export function distanceKm(a,b) {
  if (!validPoint(a)||!validPoint(b)) return null;
  const rad=n=>n*Math.PI/180;
  const h=Math.sin(rad(b.latitude-a.latitude)/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(rad(b.longitude-a.longitude)/2)**2;
  return 12742*Math.asin(Math.sqrt(Math.max(0,Math.min(1,h))));
}
export function travelMinutes(km,speedKmh=20) {
  return Number.isFinite(km)&&km>=0&&Number.isFinite(speedKmh)&&speedKmh>0 ? Math.max(1,Math.ceil(km/speedKmh*60)) : null;
}
