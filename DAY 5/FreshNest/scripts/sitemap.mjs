import fs from 'node:fs';
import { products } from '../src/data/products.js';
const base = new URL(process.env.SITE_URL);
if (base.protocol !== 'https:') throw Error('Set SITE_URL to the production HTTPS origin.');
const paths=['/','/offers','/info/about','/info/shipping',...products.map(p=>'/product/'+encodeURIComponent(p.id))];
const escape=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;');
const xml=paths.map(path=>'<url><loc>'+escape(new URL(path,base).href)+'</loc></url>').join('\n');
fs.writeFileSync('public/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+xml+'\n</urlset>\n');
