import { z } from 'zod';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';
import { fail, serial } from './operations.js';
import { sendStockNotices } from './stockWatch.js';
import { distanceKm as distance } from '../../src/lib/distance.js';
import { sellPrice } from '../../src/data/products.js';

const enabled = { active: true, store: { active: true, seller: { approved: true } } };
export const stockListings = { where: enabled, include: { store: true } };
export function availableStock(p) {
  return Math.max(0, (p.inventory?.quantity || 0) - (p.inventory?.reserved || 0), ...(p.storeListings || []).map(listing => listing.stock));
}

export function planCart(items, address) {
  const groups = new Map();
  const snapshots = items.map(({product:p,quantity}) => {
    if (!p.isActive) throw fail(409,p.name+' is no longer available.');
    const eligible = p.storeListings.map(row=>({row,km:distance(row.store,address)}))
      .filter(({row,km})=>row.store.pins.includes(address.pin)&&row.stock>=quantity&&(row.store.radiusKm==null||(km!=null&&km<=row.store.radiusKm)))
      .sort((a,b)=>(a.km??Infinity)-(b.km??Infinity)||a.row.price-b.row.price||a.row.id.localeCompare(b.row.id));
    const listing = eligible[0]?.row;
    if (!listing && (p.inventory?.quantity || 0) - (p.inventory?.reserved || 0) < quantity) throw fail(409,p.name+' is unavailable in this quantity for your address.');
    const unitPrice = listing?.price ?? sellPrice(p);
    const line = { productId:p.id,productName:p.name,brandName:p.brand.name,unit:p.unit,quantity,unitPrice,
      discount:listing?0:p.discount,taxRate:p.gst,lineTotal:unitPrice*quantity,
      ...(listing?{storeListingId:listing.id}: {}) };
    const key = listing?.storeId || '';
    if (!groups.has(key)) groups.set(key,{store:listing?.store||null,subtotal:0,items:[]});
    const group = groups.get(key);
    group.subtotal += line.lineTotal;
    group.items.push(line);
    return line;
  });
  for (const {store,subtotal} of groups.values()) {
    if (store && subtotal < store.minOrder) throw fail(400,store.name+' needs a minimum basket of ₹'+store.minOrder+'.');
  }
  return {snapshots,groups:[...groups.values()]};
}

function allocate(groups, value) {
  const total = groups.reduce((sum,g)=>sum+g.subtotal,0);
  if (!total) return groups.map(()=>0);
  let allocated=0;
  let cumulative=0;
  return groups.map(group=>{
    cumulative += group.subtotal;
    const next=Math.floor(value*cumulative/total);
    const share=next-allocated;
    allocated=next;
    return share;
  });
}

export async function reserveStores(tx,order,groups,totals) {
  const discounts=allocate(groups,totals.discount);
  const taxes=allocate(groups,totals.taxTotal);
  const fees=allocate(groups,totals.deliveryFee+totals.handlingFee+totals.smallCartFee+totals.giftFee);
  for (const [index,{store,subtotal,items}] of groups.entries()) {
    if (!store) continue;
    const discount=discounts[index];
    const commission=Math.floor((subtotal-discount)*store.commissionBps/10000);
    const sellerOrder=await tx.sellerOrder.create({data:{orderId:order.id,storeId:store.id,subtotal,discount,tax:taxes[index],
      platformFees:fees[index],commission,net:subtotal-discount-commission}});
    for (const item of items) {
      const changed=await tx.storeListing.updateMany({where:{id:item.storeListingId,stock:{gte:item.quantity}},data:{stock:{decrement:item.quantity}}});
      if (!changed.count) throw fail(409,item.productName+' stock changed. Try checkout again.');
      await tx.storeStockEvent.create({data:{listingId:item.storeListingId,delta:-item.quantity,reason:'ORDER_RESERVED',reference:order.id}});
      await tx.orderItem.updateMany({where:{orderId:order.id,storeListingId:item.storeListingId},data:{sellerOrderId:sellerOrder.id}});
    }
  }
}

const storeFields=z.object({ name:z.string().trim().min(2).max(120),address:z.string().trim().min(5).max(300),
  pins:z.array(z.string().regex(/^\d{6}$/)).min(1).max(100),minOrder:z.number().int().min(0).max(100000),
  latitude:z.number().min(-90).max(90).nullable(),longitude:z.number().min(-180).max(180).nullable(),
  radiusKm:z.number().positive().max(100).nullable()
}).refine(v=>v.radiusKm==null||(v.latitude!=null&&v.longitude!=null),'A radius requires store coordinates.');

export function registerMarketplace(app,parse) {
  const seller = async req => {
    const record=await prisma.seller.findUnique({where:{userId:req.user.id}});
    if(!record?.approved) throw fail(403,'Seller approval required.');
    return record;
  };
  const route = (method,path,role,fn) => app[method]('/api'+path,auth,roles(role),asyncHandler(fn));
  route('get','/seller/stores','SELLER',async(req,res)=>{
    const s=await seller(req);
    res.json(await prisma.store.findMany({where:{sellerId:s.id},include:{listings:{include:{product:{select:{name:true}}}}}}));
  });
  route('post','/seller/stores','SELLER',async(req,res)=>{
    const s=await seller(req);
    const data=parse(storeFields,req.body);
    res.status(201).json(await prisma.store.create({data:{...data,sellerId:s.id}}));
  });
  route('put','/seller/stores/:id/listings/:product','SELLER',async(req,res)=>{
    const s=await seller(req);
    const payload=parse(z.object({price:z.number().int().min(1).max(1000000),stock:z.number().int().min(0).max(1000000),active:z.boolean()}),req.body);
    const row=await serial(async tx=>{
      const store=await tx.store.findFirst({where:{id:req.params.id,sellerId:s.id}});
      if(!store) throw fail(404,'Store not found.');
      const product=await tx.product.findFirst({where:{id:req.params.product,isActive:true}});
      if(!product) throw fail(404,'Product not found.');
      const where={storeId_productId:{storeId:store.id,productId:product.id}};
      const previous=await tx.storeListing.findUnique({where});
      const listing=await tx.storeListing.upsert({where,update:payload,create:{storeId:store.id,productId:product.id,...payload}});
      const delta=payload.stock-(previous?.stock||0);
      if(delta) await tx.storeStockEvent.create({data:{listingId:listing.id,delta,reason:'SELLER_ADJUSTMENT'}});
      if(delta>0)await sendStockNotices(tx,product.id);
      return listing;
    });
    res.json(row);
  });
  route('get','/seller/fulfilment','SELLER',async(req,res)=>{
    const s=await seller(req);
    res.json(await prisma.sellerOrder.findMany({where:{store:{sellerId:s.id}},take:100,orderBy:{createdAt:'desc'},
      include:{items:true,store:{select:{name:true}},order:{select:{orderNumber:true,status:true,paymentMethod:true,paymentStatus:true}}}}));
  });
  route('patch','/seller/fulfilment/:id','SELLER',async(req,res)=>{
    const s=await seller(req);
    const status=parse(z.enum(['ACCEPTED','PICKING','PACKED']),req.body?.status);
    const result=await serial(async tx=>{
      const row=await tx.sellerOrder.findFirst({where:{id:req.params.id,store:{sellerId:s.id}},include:{order:true}});
      if(!row) throw fail(404,'Seller order not found.');
      if(!['PENDING','CONFIRMED','PROCESSING'].includes(row.order.status)||(row.order.paymentMethod==='RAZORPAY'&&row.order.paymentStatus!=='PAID')) throw fail(409,'Order is not available for preparation.');
      if(({PENDING:'ACCEPTED',ACCEPTED:'PICKING',PICKING:'PACKED'})[row.status]!==status) throw fail(409,'Invalid fulfilment step.');
      return tx.sellerOrder.update({where:{id:row.id},data:{status}});
    });
    res.json(result);
  });
  route('get','/admin/store-orders','ADMIN',async(_req,res)=>{
    res.json(await prisma.sellerOrder.findMany({take:100,orderBy:{createdAt:'desc'},include:{
      store:{select:{name:true}},order:{select:{orderNumber:true,status:true,paymentStatus:true}}
    }}));
  });
  route('post','/admin/store-orders/:id/settlement','ADMIN',async(req,res)=>{
    const reference=parse(z.string().trim().min(5).max(100),req.body?.reference);
    const row=await serial(async tx=>{
      const sub=await tx.sellerOrder.findUnique({where:{id:req.params.id},include:{order:{include:{refunds:true}},items:true}});
      if(!sub||sub.order.status!=='DELIVERED'||sub.order.paymentStatus!=='PAID') throw fail(409,'A delivered, paid order is required.');
      if(sub.settledAt) throw fail(409,'Settlement already recorded.');
      if(sub.order.refunds.some(refund=>!['REFUNDED','FAILED'].includes(refund.status))) throw fail(409,'Resolve outstanding refunds before settlement.');
      const ids=new Set(sub.items.map(item=>item.id));
      const refunds=sub.order.refunds.filter(refund=>refund.status==='REFUNDED').reduce((total,refund)=>total+
        (refund.orderItemId?(ids.has(refund.orderItemId)?refund.amount:0):Math.ceil(refund.amount*sub.subtotal/Math.max(sub.order.subtotal,1))),0);
      return tx.sellerOrder.update({where:{id:sub.id},data:{settlementRef:reference,settledAt:new Date(),settledAmount:Math.max(0,sub.net-refunds)}});
    });
    res.json(row);
  });
  route('get','/admin/stores','ADMIN',async(_req,res)=>res.json(await prisma.store.findMany({include:{seller:{select:{storeName:true,approved:true}}},orderBy:{name:'asc'}})));
  route('patch','/admin/stores/:id','ADMIN',async(req,res)=>{
    const data=parse(z.object({active:z.boolean(),commissionBps:z.number().int().min(0).max(10000)}),req.body);
    res.json(await prisma.store.update({where:{id:req.params.id},data}));
  });
}
