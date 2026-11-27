import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { prisma } from './db.js';
import { publishNotification } from './notifications.js';
import { auth, roles } from './middleware/auth.js';
import { fail, serial } from './operations.js';
import { asyncHandler } from './utils/http.js';

export const razorpayReady = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
const amountFor = order => order.total * 100;
const providerId = prefix => z.string().regex(new RegExp('^' + prefix + '_[a-zA-Z0-9]+$'));
const signatureSchema = z.string().regex(/^[a-f0-9]{64}$/i);
export function validSignature(data, signature, secret) {
  if (!secret || !signatureSchema.safeParse(signature).success) return false;
  const expected = createHmac('sha256', secret).update(data).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
async function razorpay(path, body, extraHeaders = {}) {
  const headers = { Authorization: 'Basic ' + Buffer.from(process.env.RAZORPAY_KEY_ID + ':' + process.env.RAZORPAY_KEY_SECRET).toString('base64') };
  let response;
  try {
    response = await fetch('https://api.razorpay.com/v1' + path, {
      headers: { ...headers, ...extraHeaders, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      method: body ? 'POST' : 'GET', body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000)
    });
  } catch {
    throw fail(503, 'Razorpay is temporarily unavailable. Try again from your order.');
  }
  if (!response.ok) {
    console.error('Razorpay API request rejected', { status: response.status });
    throw fail(502, 'Razorpay could not process your request. Try again from your order.');
  }
  return response.json();
}
async function confirmCaptured(paymentId, gatewayOrderId) {
  const record = await prisma.payment.findUnique({ where: { checkoutOrderId: gatewayOrderId }, include: { order: true } });
  if (!record || record.provider !== 'RAZORPAY') return null;
  if (record.status === 'REFUNDED') return 'REFUNDED';
  const payment = await razorpay('/payments/' + paymentId);
  if (payment.id !== paymentId || payment.order_id !== gatewayOrderId || payment.currency !== 'INR'
    || payment.amount !== amountFor(record.order)) throw fail(409, 'Payment details do not match this order.');
  if (payment.status !== 'captured') return 'PENDING';
  return serial(async tx => {
    const current = await tx.payment.findUnique({ where: { id: record.id }, include: { order: true } });
    if (current.status === 'PAID') {
      if (current.providerReference !== paymentId) throw fail(409, 'A different payment already covers this order.');
      return 'PAID';
    }
    if (current.order.status !== 'PENDING' || current.status !== 'PENDING') throw fail(409, 'This order requires payment review.');
    await tx.payment.update({ where: { id: current.id }, data: { status: 'PAID', providerReference: paymentId } });
    await tx.order.update({ where: { id: current.orderId }, data: { paymentStatus: 'PAID' } });
    await publishNotification(tx,current.order.userId,'Payment confirmed',current.order.orderNumber,'/track/'+current.order.orderNumber);
    return 'PAID';
  });
}
export const razorpayWebhook = asyncHandler(async (req, res) => {
  if (!razorpayReady() || !process.env.RAZORPAY_WEBHOOK_SECRET) throw fail(503, 'Payment webhook is not configured.');
  if (!Buffer.isBuffer(req.body) || !validSignature(req.body, req.get('x-razorpay-signature'), process.env.RAZORPAY_WEBHOOK_SECRET)) {
    throw fail(400, 'Invalid webhook signature.');
  }
  let event;
  try { event = JSON.parse(req.body.toString('utf8')); } catch { throw fail(400, 'Invalid webhook payload.'); }
  if (event.event === 'payment.captured') {
    const payment = event.payload?.payment?.entity;
    if (!providerId('pay').safeParse(payment?.id).success || !providerId('order').safeParse(payment?.order_id).success) throw fail(400, 'Invalid payment identifiers.');
    const result = await confirmCaptured(payment.id, payment.order_id);
    if (result === 'PENDING') throw fail(503, 'Payment capture is still being reconciled.');
  }
  if (['refund.processed','refund.failed'].includes(event.event)) {
    const value=event.payload?.refund?.entity;
    if (!providerId('rfnd').safeParse(value?.id).success) throw fail(400,'Invalid refund identifier.');
    const record=await prisma.refund.findFirst({where:{OR:[{gatewayRefundId:value.id},...(typeof value.receipt==='string'?[{id:value.receipt}]:[])]}});
    if(record && ['PROCESSING','REFUNDED','FAILED'].includes(record.status)){
      const verified=await razorpay('/refunds/'+value.id);
      await updateRefund(record.id,verified);
    }
  }
  res.json({ received: true });
});

async function updateRefund(id, gateway) {
  const status={pending:'PROCESSING',processed:'REFUNDED',failed:'FAILED'}[gateway.status];
  if(!status||!providerId('rfnd').safeParse(gateway.id).success) throw fail(502,'Unexpected Razorpay refund status.');
  return serial(async tx=>{
    const refund=await tx.refund.findUniqueOrThrow({where:{id},include:{order:true}});
    const payment=await tx.payment.findFirst({where:{orderId:refund.orderId,provider:'RAZORPAY'}});
    if(!payment?.providerReference||gateway.payment_id!==payment.providerReference||gateway.amount!==refund.amount*100
      ||(gateway.currency&&gateway.currency!=='INR')||(refund.gatewayRefundId&&refund.gatewayRefundId!==gateway.id)){
      throw fail(409,'Refund details do not match the order.');
    }
    if(refund.status==='REFUNDED'||refund.status==='FAILED') return refund;
    if(refund.status!=='PROCESSING') throw fail(409,'Refund was not submitted.');
    const row=await tx.refund.update({where:{id},data:{gatewayRefundId:gateway.id,providerReference:gateway.id,status}});
    if(status==='REFUNDED'){
      const total=(await tx.refund.aggregate({where:{orderId:refund.orderId,status:'REFUNDED'},_sum:{amount:true}}))._sum.amount||0;
      if(total>=refund.order.total){
        await tx.order.update({where:{id:refund.orderId},data:{paymentStatus:'REFUNDED'}});
        await tx.payment.update({where:{id:payment.id},data:{status:'REFUNDED'}});
        await tx.returnRequest.updateMany({where:{orderId:refund.orderId,status:'RETURNED'},data:{status:'REFUNDED'}});
      }
      await publishNotification(tx,refund.order.userId,'Refund confirmed','₹'+refund.amount+' · '+refund.order.orderNumber,'/track/'+refund.order.orderNumber);
    }
    return row;
  });
}
export function registerRazorpay(app, parse) {
  app.post('/api/admin/orders/:id/refund-request',auth,roles('ADMIN'),asyncHandler(async(req,res)=>{
    const {amount,reason,requestKey,orderItemId}=parse(z.object({amount:z.number().int().positive(),reason:z.string().trim().min(5).max(400),
      requestKey:z.string().uuid(),orderItemId:z.string().optional()}),req.body);
    const row=await serial(async tx=>{
      const previous=await tx.refund.findUnique({where:{requestKey}});
      if(previous){
        if(previous.orderId!==req.params.id||previous.amount!==amount||previous.orderItemId!==(orderItemId||null)) throw fail(409,'Refund request key already used.');
        return previous;
      }
      const order=await tx.order.findUnique({where:{id:req.params.id},include:{items:true}});
      if(!order||order.paymentStatus!=='PAID') throw fail(409,'Only paid orders can be refunded.');
      const existing=await tx.refund.findMany({where:{orderId:order.id,status:{not:'FAILED'}}});
      if(existing.reduce((sum,row)=>sum+row.amount,0)+amount>order.total) throw fail(409,'Refund exceeds the remaining paid total.');
      if(orderItemId){
        const item=order.items.find(row=>row.id===orderItemId);
        if(!item) throw fail(400,'Select an item from this order.');
        const limit=item.lineTotal-Math.ceil(order.discount*item.lineTotal/Math.max(order.subtotal,1));
        if(existing.filter(row=>row.orderItemId===orderItemId).reduce((sum,row)=>sum+row.amount,0)+amount>limit) throw fail(409,'Refund exceeds the remaining item total.');
      }
      return tx.refund.create({data:{orderId:order.id,amount,requestKey,orderItemId,reason}});
    });
    res.status(201).json(row);
  }));
  app.post('/api/admin/refunds/:id/razorpay',auth,roles('ADMIN'),asyncHandler(async(req,res)=>{
    if(!razorpayReady()) throw fail(503,'Online payments are not configured.');
    const record=await serial(async tx=>{
      const row=await tx.refund.findUnique({where:{id:req.params.id},include:{order:true}});
      if(!row||row.order.paymentMethod!=='RAZORPAY'||!['REQUESTED','PROCESSING'].includes(row.status)) throw fail(409,'Refund is unavailable for submission.');
      const payment=await tx.payment.findFirst({where:{orderId:row.orderId,provider:'RAZORPAY',status:'PAID'}});
      if(!payment?.providerReference) throw fail(409,'Razorpay payment capture has not been verified.');
      const reserved=(await tx.refund.aggregate({where:{orderId:row.orderId,status:{not:'FAILED'}},_sum:{amount:true}}))._sum.amount||0;
      if(reserved>payment.amount) throw fail(409,'Outstanding refunds exceed the captured amount.');
      await tx.refund.update({where:{id:row.id},data:{status:'PROCESSING'}});
      return {...row,paymentId:payment.providerReference};
    });
    const gateway=record.gatewayRefundId ? await razorpay('/refunds/'+record.gatewayRefundId)
      : await razorpay('/payments/'+record.paymentId+'/refund',{amount:record.amount*100,receipt:record.id},{'X-Refund-Idempotency':record.id});
    res.json(await updateRefund(record.id,gateway));
  }));
  const ownOrder = async (user, orderNumber) => {
    const order = await prisma.order.findFirst({ where: { orderNumber, userId: user, paymentMethod: 'RAZORPAY' } });
    if (!order) throw fail(404, 'Online order not found.');
    return order;
  };
  app.post('/api/orders/:number/razorpay', auth, asyncHandler(async (req, res) => {
    if (!razorpayReady()) throw fail(503, 'Online payments are not configured.');
    const order = await ownOrder(req.user.id, req.params.number);
    if (order.paymentStatus === 'PAID') return res.json({ status: 'PAID' });
    if (order.status !== 'PENDING' || order.paymentStatus !== 'PENDING') throw fail(409, 'This order cannot be paid.');
    const payment = await prisma.payment.findFirstOrThrow({ where: { orderId: order.id, provider: 'RAZORPAY' } });
    let orderId = payment.checkoutOrderId;
    if (!orderId) {
      const gateway = await razorpay('/orders', { amount: amountFor(order), currency: 'INR', receipt: order.orderNumber });
      if (!providerId('order').safeParse(gateway.id).success || gateway.amount !== amountFor(order) || gateway.currency !== 'INR') {
        throw fail(502, 'Razorpay returned an unexpected order.');
      }
      const saved = await prisma.payment.updateMany({
        where: { id: payment.id, checkoutOrderId: null, status: 'PENDING' },
        data: { checkoutOrderId: gateway.id }
      });
      orderId = saved.count ? gateway.id : (await prisma.payment.findUnique({ where: { id: payment.id } })).checkoutOrderId;
      if (!orderId) throw fail(409, 'This order cannot be paid.');
    }
    res.json({ status: 'PENDING', orderId, currency: 'INR', amount: amountFor(order), keyId: process.env.RAZORPAY_KEY_ID });
  }));
  app.post('/api/orders/:number/razorpay/reconcile', auth, asyncHandler(async(req,res)=>{
    if(!razorpayReady()) throw fail(503,'Online payments are not configured.');
    const order=await ownOrder(req.user.id,req.params.number);
    if(order.paymentStatus!=='PENDING') return res.json({status:order.paymentStatus});
    const record=await prisma.payment.findFirst({where:{orderId:order.id,provider:'RAZORPAY'}});
    if(!record?.checkoutOrderId) return res.json({status:'PENDING'});
    const attempts=await razorpay('/orders/'+record.checkoutOrderId+'/payments');
    const captured=attempts.items?.find(payment=>payment.status==='captured'&&providerId('pay').safeParse(payment.id).success);
    const status=captured ? await confirmCaptured(captured.id,record.checkoutOrderId) : 'PENDING';
    res.json({status});
  }));
  app.post('/api/orders/:number/razorpay/verify', auth, asyncHandler(async (req, res) => {
    if (!razorpayReady()) throw fail(503, 'Online payments are not configured.');
    const { razorpay_payment_id: paymentId, razorpay_order_id: gatewayOrderId, razorpay_signature: signature } = parse(z.object({
      razorpay_payment_id: providerId('pay'), razorpay_order_id: providerId('order'), razorpay_signature: signatureSchema
    }), req.body);
    const order = await ownOrder(req.user.id, req.params.number);
    const record = await prisma.payment.findUnique({ where: { checkoutOrderId: gatewayOrderId } });
    if (!record || record.orderId !== order.id || !validSignature(record.checkoutOrderId + '|' + paymentId, signature, process.env.RAZORPAY_KEY_SECRET)) {
      throw fail(400, 'Payment signature did not match your order.');
    }
    const status = await confirmCaptured(paymentId, gatewayOrderId);
    res.json({ status });
  }));
}
