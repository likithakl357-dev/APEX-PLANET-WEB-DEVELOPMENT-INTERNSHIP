import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const names=['backend/src/app.js','src/components/LocationModal.jsx','src/lib/geocode.js','src/components/AddressManager.jsx'];
const original=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(root,n),'utf8')]));
const updated={...original};
const replace=(s,a,b)=>{if(!s.includes(a))throw new Error('Expected source pattern missing: '+a.slice(0,110));return s.replace(a,b);};
let app=original[names[0]];
// Remove the route supplied in the previous instructions if present, regardless of line endings.
const oldRoute=/app\.get\('\/api\/reverse-geocode',\s*rateLimit\(\{ windowMs: 60000, limit: 20 \}\),[\s\S]*?\n\);\s*/;
if(app.includes("app.get('/api/reverse-geocode',")&&!app.includes('// FRESHNEST_LOCATION_FIX')) {
 if(!oldRoute.test(app))throw new Error('Existing reverse-geocode route is different; no files changed.');
 app=app.replace(oldRoute,'');
}
if(!app.includes('// FRESHNEST_LOCATION_FIX')){
 const corsLine=app.split(/\r?\n/).find(l=>l.startsWith('app.use(cors('));
 if(!corsLine)throw new Error('CORS middleware not found');
 app=replace(app,corsLine,corsLine+`\n// FRESHNEST_LOCATION_FIX\napp.get('/api/reverse-geocode', rateLimit({ windowMs: 60000, limit: 20 }), async (req,res)=>{\n  const lat=Number(req.query.lat),lon=Number(req.query.lon);\n  if(typeof req.query.lat!=='string'||typeof req.query.lon!=='string'||!req.query.lat.trim()||!req.query.lon.trim()||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({error:'Invalid coordinates'});\n  res.set('Cache-Control','no-store');\n  const key=process.env.GEOAPIFY_API_KEY;\n  if(!key)return res.status(503).json({error:'Geoapify is not configured'});\n  try {\n    const url=new URL('https://api.geoapify.com/v1/geocode/reverse');\n    url.search=new URLSearchParams({lat:String(lat),lon:String(lon),format:'json',lang:'en',apiKey:key}).toString();\n    const response=await fetch(url,{signal:AbortSignal.timeout(8000)});\n    if(!response.ok){console.error('Geoapify HTTP status:',response.status);return res.status(502).json({error:'Address provider request failed'});}\n    const data=await response.json();const a=data.results?.[0];\n    if(!a?.formatted)return res.status(404).json({error:'Address not found'});\n    return res.json({text:a.formatted,pin:a.postcode||'',city:a.city||a.town||a.village||a.county||'',state:a.state||'',country:a.country||'',countryCode:a.country_code||''});\n  }catch(e){console.error('Geoapify lookup failed:',e.name);return res.status(502).json({error:'Address lookup failed'});}\n});\n`);
}
updated[names[0]]=app;
let modal=original[names[1]];
if(!modal.includes('FRESHNEST_GUEST_GPS')){
 modal=replace(modal,'{authToken && <button className="locate-btn"','{/* FRESHNEST_GUEST_GPS */}<button className="locate-btn"');
 modal=replace(modal,'Detect your address with your browser</small></span></button>}','Detect your address with your browser</small></span></button>');
 // Avoid aborting requests when parent renders with a new onClose callback.
 modal=replace(modal,'const run = useRef(0); const ctl = useRef(null);','const run = useRef(0); const ctl = useRef(null); const closeRef = useRef(onClose); closeRef.current = onClose;');
 modal=replace(modal,"e.key === 'Escape' && onClose()","e.key === 'Escape' && closeRef.current()");
 modal=replace(modal,'}, [onClose]);','}, []);');
 modal=replace(modal,"onClick={() => setView('manual')}>Enter address manually","onClick={() => authToken ? setView('manual') : setView('list')}>Enter address manually");
 modal=replace(modal,'<AddressForm key={`${found.lat},${found.lon}`}','{authToken ? <AddressForm key={`${found.lat},${found.lon}`}');
 modal=replace(modal,"source: 'current-location' }} />","source: 'current-location' }} /> : <><p>{found.geo?.text || 'Confirm your delivery PIN below.'}</p><label htmlFor=\"guest-detected-pin\">Delivery PIN code</label><input id=\"guest-detected-pin\" inputMode=\"numeric\" maxLength={6} value={pin} onChange={e=>setPin(e.target.value.replace(/\\D/g,''))}/><button className=\"primary wide\" disabled={!configuration.serviceAreas.some(x=>x.pin===pin&&x.serviceable)} onClick={()=>{selectGuestPin(pin);notify('Delivery location updated');onClose();}}>Use this delivery PIN</button><button className=\"secondary\" onClick={()=>{onClose();go('/account/addresses');}}>Sign in to save full address</button></>}");
}
updated[names[1]]=modal;
let geo=original[names[2]];
if(!geo.includes('FRESHNEST_GEOCODE_DEFAULT'))geo=replace(geo,"const ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEOCODE_ENDPOINT) || '';", "// FRESHNEST_GEOCODE_DEFAULT\nconst env = import.meta.env || {};\nconst ENDPOINT = env.VITE_GEOCODE_ENDPOINT || `${(env.VITE_API_URL || 'http://localhost:4000/api').replace(/\\/$/, '')}/reverse-geocode`; ");
geo=geo.replace("'your configured address service'", "'Geoapify'");
updated[names[2]]=geo;
let addr=original[names[3]];
if(!addr.includes('FRESHNEST_ADDRESS_GPS')){
 addr=replace(addr,"import { getCurrentPosition } from '../lib/geolocation.js';", "import { getCurrentPosition } from '../lib/geolocation.js';\nimport { reverseGeocode } from '../lib/geocode.js';");
 addr=replace(addr,"const set = patch => setA(x => ({ ...x, ...patch }));",`const set = patch => setA(x => ({ ...x, ...patch }));\n  // FRESHNEST_ADDRESS_GPS\n  const [locating,setLocating]=useState(false);\n  const detectAddress=async()=>{\n    setErr('');setLocating(true);\n    try{\n      const pos=await getCurrentPosition();\n      set({lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy});\n      try{const geo=await reverseGeocode(pos.lat,pos.lon);set({text:geo.text,city:geo.city,state:geo.state,pin:geo.pin});}\n      catch(e){setErr('GPS detected. Address lookup failed: '+e.message+'. Confirm the address manually.');}\n    }catch(e){setErr(e.message||'Location unavailable. Allow browser location access.');}\n    finally{setLocating(false);}\n  };`);
 addr=replace(addr,`onClick={async()=>{setErr('');try{const pos=await getCurrentPosition();set({lat:pos.lat,lon:pos.lon,accuracy:pos.accuracy});}catch(e){setErr('Location unavailable. Allow browser location access or choose a pin on the map.');}}}>Use current GPS location`, `disabled={locating} onClick={detectAddress}>{locating?'Finding your address…':'Use current GPS location'}`);
}
updated[names[3]]=addr;
const backup=path.join(root,'.freshnest-location-backup-'+Date.now());
fs.mkdirSync(backup,{recursive:true});
for(const n of names){const b=path.join(backup,n);fs.mkdirSync(path.dirname(b),{recursive:true});fs.writeFileSync(b,original[n]);}
for(const n of names)fs.writeFileSync(path.join(root,n),updated[n]);
// Add ignore rule for source-only backup directory; never touch credentials.
const ignore=path.join(root,'.gitignore');const rules=fs.existsSync(ignore)?fs.readFileSync(ignore,'utf8'):'';if(!rules.includes('.freshnest-location-backup-*/'))fs.appendFileSync(ignore,'\n.freshnest-location-backup-*/\n');
console.log('FreshNest location patch applied. Original source files backed up in '+backup);
console.log('Restart backend and frontend. Existing environment files and database were not changed.');
