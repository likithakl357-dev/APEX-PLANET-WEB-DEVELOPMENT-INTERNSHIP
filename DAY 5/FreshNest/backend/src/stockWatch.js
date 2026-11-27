import { prisma } from './db.js';
import { auth } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';
import { fail, serial } from './operations.js';
import { availableStock, stockListings } from './marketplace.js';

export async function sendStockNotices(tx, productId) {
  const product=await tx.product.findUnique({where:{id:productId},include:{inventory:true,storeListings:stockListings}});
  if(!product?.isActive||availableStock(product)<1) return;
  const rows=await tx.stockWatch.findMany({where:{productId},select:{userId:true}});
  if(!rows.length)return;
  await tx.notification.createMany({data:rows.map(({userId})=>({userId,title:'Back in stock',message:product.name,href:'/product/'+productId}))});
  await tx.stockWatch.deleteMany({where:{productId}});
}
export function registerStockWatches(app) {
  app.put('/api/products/:id/stock-watch',auth,asyncHandler(async(req,res)=>{
    const productId=req.params.id;
    await serial(async tx=>{
      const p=await tx.product.findUnique({where:{id:productId},include:{inventory:true,storeListings:stockListings}});
      if(!p?.isActive)throw fail(404,'Product not found.');
      if(availableStock(p)>0)throw fail(409,'This item is currently in stock.');
      await tx.stockWatch.upsert({where:{userId_productId:{userId:req.user.id,productId}},update:{},create:{userId:req.user.id,productId}});
    });
    res.json({subscribed:true});
  }));
}
