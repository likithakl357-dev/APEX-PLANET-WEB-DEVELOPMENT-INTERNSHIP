import { z } from 'zod';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';

const codeSchema=z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,24}$/);
const values=z.object({type:z.enum(['PERCENT','FLAT','FREE_DELIVERY']),value:z.number().int().min(0).max(100000),
  minOrder:z.number().int().min(0).max(100000),maxDiscount:z.number().int().positive().max(100000).nullable(),
  usageLimit:z.number().int().positive().max(1000000).nullable(),active:z.boolean(),
  startsAt:z.iso.datetime().nullable(),expiresAt:z.iso.datetime().nullable()
}).refine(c=>c.type==='FREE_DELIVERY'?c.value===0:c.value>0&&(c.type!=='PERCENT'||c.value<=100),'Check discount value.')
  .refine(c=>!c.startsAt||!c.expiresAt||c.startsAt<c.expiresAt,'End date must follow start date.');
export async function publicCoupons() {
  const time=new Date();
  const rows=await prisma.coupon.findMany({where:{active:true,AND:[
    {OR:[{startsAt:null},{startsAt:{lte:time}}]},{OR:[{expiresAt:null},{expiresAt:{gt:time}}]}
  ]},orderBy:{code:'asc'},take:100});
  return rows.map(c=>({code:c.code,type:c.type.toLowerCase().replace('_',''),value:c.value,min:c.minOrder,max:c.maxDiscount,
    firstOrderOnly:c.code==='FIRST25',
    title:(c.type==='FLAT'?'₹'+c.value+' off':c.type==='PERCENT'?c.value+'% off':'Free delivery')+' on qualifying orders'}));
}
export function registerPromotions(app,parse) {
  app.get('/api/admin/coupons',auth,roles('ADMIN'),asyncHandler(async(_req,res)=>res.json(await prisma.coupon.findMany({orderBy:{code:'asc'},take:200}))));
  app.put('/api/admin/coupons/:code',auth,roles('ADMIN'),asyncHandler(async(req,res)=>{
    const code=parse(codeSchema,req.params.code);
    const input=parse(values,req.body);
    const data={...input,startsAt:input.startsAt?new Date(input.startsAt):null,expiresAt:input.expiresAt?new Date(input.expiresAt):null};
    res.json(await prisma.coupon.upsert({where:{code},create:{code,...data},update:data}));
  }));
}
