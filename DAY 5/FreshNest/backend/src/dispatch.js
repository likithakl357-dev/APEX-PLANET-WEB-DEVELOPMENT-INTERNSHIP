import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';
import { publishNotification } from './notifications.js';
import { z } from 'zod';

export async function assignAvailablePartner(tx,order) {
  if(process.env.AUTO_ASSIGN_DELIVERY!=='true') return;
  if(await tx.deliveryAssignment.findUnique({where:{orderId:order.id}})) return;
  const partner=await tx.user.findFirst({
    where:{role:'DELIVERY_PARTNER',deliveryAvailable:true,isActive:true,
      deliveryAssignments:{none:{status:{in:['ASSIGNED','ACCEPTED','PICKED_UP','OUT_FOR_DELIVERY']}}}},
    orderBy:{id:'asc'},select:{id:true}
  });
  if(!partner)return;
  await tx.deliveryAssignment.create({data:{orderId:order.id,partnerId:partner.id}});
  await publishNotification(tx,partner.id,'New delivery assignment',order.orderNumber,'/delivery');
  await publishNotification(tx,order.userId,'Delivery partner assigned',order.orderNumber,'/track/'+order.orderNumber);
}

export function registerDispatch(app,parse) {
  app.get('/api/delivery/availability',auth,roles('DELIVERY_PARTNER'),(req,res)=>res.json({available:req.user.deliveryAvailable}));
  app.put('/api/delivery/availability',auth,roles('DELIVERY_PARTNER'),asyncHandler(async(req,res)=>{
    const available=parse(z.boolean(),req.body?.available);
    await prisma.user.update({where:{id:req.user.id},data:{deliveryAvailable:available}});
    res.json({available});
  }));
}
