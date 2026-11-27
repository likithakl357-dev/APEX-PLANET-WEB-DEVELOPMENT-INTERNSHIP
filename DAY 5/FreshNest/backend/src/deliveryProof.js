import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { prisma } from './db.js';
import { auth, roles } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';
import { fail, serial, transitionOrder } from './operations.js';

const codeFor = proof => String(createHmac('sha256', process.env.JWT_SECRET)
  .update('delivery-v1:' + proof.orderId + ':' + proof.nonce).digest().readUInt32BE() % 1000000).padStart(6,'0');

export function registerDeliveryProof(app, parse) {
  app.post('/api/orders/:number/delivery-code', auth, asyncHandler(async(req,res) => {
    const proof = await serial(async tx => {
      const order = await tx.order.findFirst({ where: { userId: req.user.id, orderNumber: req.params.number, status: 'OUT_FOR_DELIVERY' } });
      if (!order) throw fail(404, 'No active delivery found.');
      const current = await tx.deliveryProof.findUnique({where:{orderId:order.id}});
      if (current?.confirmedAt) throw fail(409, 'Delivery is already confirmed.');
      if (current && current.expiresAt > new Date()) return current;
      const values = { nonce: randomUUID(), expiresAt: new Date(Date.now()+12*3600000), attempts: 0 };
      return tx.deliveryProof.upsert({where:{orderId:order.id},create:{orderId:order.id,...values},update:values});
    });
    if (proof.attempts >= 5) throw fail(429,'Delivery verification is locked. Contact support.');
    res.set('Cache-Control','no-store').json({ code: codeFor(proof), expiresAt: proof.expiresAt });
  }));
  app.post('/api/delivery/assignments/:id/confirm', auth, roles('DELIVERY_PARTNER'), asyncHandler(async(req,res) => {
    const code = parse(z.string().regex(/^\d{6}$/), req.body?.code);
    const order = await serial(async tx => {
      const assignment = await tx.deliveryAssignment.findFirst({where:{id:req.params.id,partnerId:req.user.id,status:'OUT_FOR_DELIVERY'}});
      if (!assignment) throw fail(404,'Active delivery not found.');
      const proof = await tx.deliveryProof.findUnique({where:{orderId:assignment.orderId}});
      if (!proof || proof.confirmedAt || proof.expiresAt <= new Date() || proof.attempts >= 5) return null;
      if (!timingSafeEqual(Buffer.from(code),Buffer.from(codeFor(proof)))) {
        await tx.deliveryProof.update({where:{orderId:proof.orderId},data:{attempts:{increment:1}}});
        return null;
      }
      await tx.deliveryProof.update({where:{orderId:proof.orderId},data:{confirmedAt:new Date(),actorId:req.user.id}});
      return transitionOrder(tx,proof.orderId,'DELIVERED','Delivery confirmed with customer code');
    });
    if (!order) throw fail(400,'Delivery code is invalid or unavailable.');
    res.json(order);
  }));
  app.post('/api/admin/orders/:id/delivery-exception', auth, roles('ADMIN'), asyncHandler(async(req,res) => {
    const reason = parse(z.string().trim().min(15).max(500), req.body?.reason);
    const order = await serial(async tx => {
      const active = await tx.order.findUnique({where:{id:req.params.id}});
      if(active?.status!=='OUT_FOR_DELIVERY') throw fail(409,'No active delivery requires an exception.');
      const details = { confirmedAt:new Date(), actorId:req.user.id, exceptionReason:reason };
      await tx.deliveryProof.upsert({where:{orderId:req.params.id},update:details,
        create:{orderId:req.params.id,nonce:randomUUID(),expiresAt:new Date(),...details}});
      return transitionOrder(tx,req.params.id,'DELIVERED','Operator-confirmed delivery: '+reason);
    });
    res.json(order);
  }));
}
