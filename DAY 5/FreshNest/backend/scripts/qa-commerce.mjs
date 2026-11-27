import assert from 'node:assert/strict';
import { createHmac, generateKeyPairSync, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';

if (process.env.FRESHNEST_QA_CONFIRM !== 'true' || !process.env.DATABASE_URL) {
  throw Error('Set FRESHNEST_QA_CONFIRM=true and DATABASE_URL for a disposable, seeded test database.');
}
const tag = randomUUID().slice(0, 8);
const nativeFetch = globalThis.fetch;
const inbox = new Map();
const googleClient = 'freshnest-qa.apps.googleusercontent.com';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const key = { ...publicKey.export({format:'jwk'}), kid:'freshnest-qa', alg:'RS256' };
Object.assign(process.env, {
  NODE_ENV:'production', AUTH_DEV_OTP:'false', AUTO_ASSIGN_DELIVERY:'true', JWT_SECRET:randomUUID()+randomUUID(),
  RESEND_API_KEY:'fixture', RESEND_FROM:'FreshNest QA <qa@example.test>', GOOGLE_CLIENT_ID:googleClient,
  RAZORPAY_KEY_ID:'rzp_test_fixture', RAZORPAY_KEY_SECRET:'fixture-payment-key', RAZORPAY_WEBHOOK_SECRET:'fixture-webhook-key'
});
let gatewayOrder, gatewayRefund, refundProcessed = false;
const payments = () => ({ id:'pay_fixture', order_id:gatewayOrder.id, amount:gatewayOrder.amount, currency:'INR', status:'captured' });
globalThis.fetch = async (url, options) => {
  if (url === 'https://api.resend.com/emails') {
    const { to, text } = JSON.parse(options.body);
    inbox.set(to[0],text.match(/\b\d{6}\b/)[0]);
    return Response.json({ id:'delivery-fixture' });
  }
  if (url === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({keys:[key]});
  if (url === 'https://api.razorpay.com/v1/orders') {
    gatewayOrder = { ...JSON.parse(options.body), id:'order_'+tag };
    return Response.json(gatewayOrder);
  }
  if (url === 'https://api.razorpay.com/v1/payments/pay_fixture') return Response.json(payments());
  if (gatewayOrder && url === 'https://api.razorpay.com/v1/orders/'+gatewayOrder.id+'/payments') return Response.json({items:[payments()]});
  if (url === 'https://api.razorpay.com/v1/payments/pay_fixture/refund') {
    const { amount, receipt } = JSON.parse(options.body);
    assert.equal(options.headers['X-Refund-Idempotency'],receipt);
    gatewayRefund = { amount, receipt, id:'rfnd_'+tag, payment_id:'pay_fixture', currency:'INR', status:'pending' };
    return Response.json(gatewayRefund);
  }
  if (gatewayRefund && url === 'https://api.razorpay.com/v1/refunds/'+gatewayRefund.id) return Response.json({...gatewayRefund,status:refundProcessed?'processed':'pending'});
  if (String(url).startsWith('https://')) throw Error('Unexpected external test request');
  return nativeFetch(url,options);
};
const { app } = await import('../src/app.js');
const { prisma } = await import('../src/db.js');
const server = app.listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+server.address().port+'/api';
async function call(path,{token,method='POST',body,expected=200,headers={}}={}) {
  const response=await fetch(base+path,{method,headers:{...(token?{Authorization:'Bearer '+token}:{}),
    ...(body===undefined?{}:{'Content-Type':'application/json'}),...headers},
    body:typeof body==='string'?body:body===undefined?body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  const data=await response.json();
  assert.equal(response.status,expected,path+' '+JSON.stringify(data));
  return data;
}
async function signIn(prefix,role) {
  const email=prefix+'-'+tag+'@gmail.com';
  const sent=await call('/auth/email/request',{body:{email}});
  assert.equal(sent.developmentOtp,undefined);
  const otp=inbox.get(email);
  assert.match(otp,/^\d{6}$/);
  const session=await call('/auth/email/verify',{body:{email,otp}});
  if(role) await prisma.user.update({where:{id:session.user.id},data:{role}});
  return {...session,email,otp};
}
const hmac=(value,secret)=>createHmac('sha256',secret).update(value).digest('hex');
try {
  assert.equal((await call('/health',{method:'GET'})).ok,true);
  const { items,total }=await call('/products?limit=500',{method:'GET'});
  assert.equal(total,400);
  const usable=items.filter(item=>item.stock>3 && item.price>50);
  const [p1,p2,p3,p4]=usable;
  const customer=await signIn('customer');
  const admin=await signIn('admin','ADMIN');
  const rider=await signIn('rider','DELIVERY_PARTNER');
  const sellers=await Promise.all([signIn('vendorone','SELLER'),signIn('vendortwo','SELLER')]);
  await call('/auth/email/verify',{body:{email:customer.email,otp:customer.otp},expected:400});
  await call('/auth/email/request',{body:{email:customer.email},expected:429});
  const credential=audience=>jwt.sign({email:customer.email,email_verified:true,name:'FreshNest QA'},privateKey,{
    algorithm:'RS256',keyid:key.kid,audience,issuer:'https://accounts.google.com',subject:'qa-'+tag,expiresIn:'5m'
  });
  await call('/auth/google',{body:{credential:credential('incorrect')},expected:401});
  const google=await call('/auth/google',{body:{credential:credential(googleClient)}});
  assert.equal(google.user.id,customer.user.id);

  await call('/admin/delivery-zones/600001',{method:'PUT',token:customer.token,expected:403,body:{}});
  await call('/admin/delivery-zones/600001',{method:'PUT',token:admin.token,body:{area:'QA delivery zone',eta:20,deliveryFee:35,serviceable:true}});
  await call('/delivery/availability',{method:'PUT',token:rider.token,body:{available:true}});
  for (const [index,seller] of sellers.entries()) {
    await prisma.seller.create({data:{userId:seller.user.id,storeName:'QA Seller '+index,approved:true}});
    const row=await call('/seller/stores',{token:seller.token,expected:201,body:{name:'QA Store '+index,address:'Test pickup address',
      pins:['600001'],minOrder:0,latitude:null,longitude:null,radiusKm:null}});
    seller.store=row;
    await call('/admin/stores/'+row.id,{method:'PATCH',token:admin.token,body:{active:true,commissionBps:1000}});
    await call('/seller/stores/'+row.id+'/listings/'+[p1,p2][index].id,{method:'PUT',token:seller.token,body:{price:85+index,stock:5,active:true}});
  }
  await call('/seller/stores/'+sellers[1].store.id+'/listings/'+p1.id,{method:'PUT',token:sellers[0].token,expected:404,body:{price:1,stock:10,active:true}});
  const token=customer.token;
  const campaign='QA'+tag.toUpperCase();
  await call('/admin/coupons/'+campaign,{method:'PUT',token:admin.token,body:{
    type:'FLAT',value:15,minOrder:150,maxDiscount:null,usageLimit:10,startsAt:null,expiresAt:null,active:true
  }});
  const config=await call('/config',{method:'GET'});
  assert.ok(config.coupons.some(c=>c.code===campaign));
  await prisma.inventory.update({where:{productId:p4.id},data:{quantity:0}});
  await call('/products/'+p4.id+'/stock-watch',{method:'PUT',token});
  await call('/admin/products/'+p4.id+'/inventory',{method:'PATCH',token:admin.token,body:{quantity:8}});
  assert.ok((await call('/notifications',{token,method:'GET'})).some(row=>row.title==='Back in stock'));
  assert.ok((await call('/admin/overview',{token:admin.token,method:'GET'})).stores>=2);
  const merge={mergeId:randomUUID(),items:[{productId:p1.id,quantity:2},{productId:p2.id,quantity:1}]};
  await Promise.all([call('/cart/merge',{token,body:merge}),call('/cart/merge',{token,body:merge})]);
  const cart=await call('/cart',{token,method:'GET'});
  assert.equal(cart.items.find(item=>item.productId===p1.id).quantity,2);
  const address=await call('/addresses',{token,expected:201,body:{line1:'QA customer address',city:'Chennai',state:'Tamil Nadu',pin:'600001'}});
  const quote=await call('/checkout/quote',{token,body:{addressId:address.id}});
  assert.equal(quote.stores.length,2);
  assert.equal(quote.totals.subtotal,256);
  assert.equal(quote.totals.deliveryFee,35);
  assert.equal((await call('/checkout/quote',{token,body:{addressId:address.id,couponCode:campaign}})).totals.discount,15);
  await call('/orders',{token,expected:409,body:{addressId:address.id,expectedTotal:1,idempotencyKey:randomUUID()}});
  const cod=await call('/orders',{token,expected:201,body:{addressId:address.id,expectedTotal:quote.totals.total,idempotencyKey:randomUUID()}});
  for (const seller of sellers) {
    const orders=await call('/seller/fulfilment',{token:seller.token,method:'GET'});
    assert.equal(orders.length,1);
    for (const status of ['ACCEPTED','PICKING','PACKED']) await call('/seller/fulfilment/'+orders[0].id,{token:seller.token,method:'PATCH',body:{status}});
  }
  for (const status of ['CONFIRMED','PROCESSING','PACKED']) await call('/admin/orders/'+cod.id+'/status',{token:admin.token,method:'PATCH',body:{status}});
  const [assignment]=await call('/delivery/assignments',{token:rider.token,method:'GET'});
  assert.equal(assignment.order.id,cod.id);
  for(const status of ['ACCEPTED','PICKED_UP','OUT_FOR_DELIVERY']) await call('/delivery/assignments/'+assignment.id+'/status',{token:rider.token,method:'PATCH',body:{status}});
  await call('/orders/'+cod.orderNumber+'/delivery-code',{token:rider.token,expected:404});
  const {code}=await call('/orders/'+cod.orderNumber+'/delivery-code',{token});
  await call('/delivery/assignments/'+assignment.id+'/confirm',{token:rider.token,expected:400,body:{code:code==='000000'?'000001':'000000'}});
  assert.equal((await call('/delivery/assignments/'+assignment.id+'/confirm',{token:rider.token,body:{code}})).status,'DELIVERED');
  assert.ok((await call('/notifications',{token,method:'GET'})).length>=4);
  const [settlement]=await call('/admin/store-orders',{token:admin.token,method:'GET'});
  assert.ok((await call('/admin/store-orders/'+settlement.id+'/settlement',{token:admin.token,body:{reference:'QA-VERIFIED-'+tag}})).settledAt);

  await call('/cart/items/'+p3.id,{token,method:'PUT',body:{quantity:1}});
  const online=await call('/orders',{token,expected:201,body:{addressId:address.id,paymentMethod:'RAZORPAY',idempotencyKey:randomUUID()}});
  const gateway=await call('/orders/'+online.orderNumber+'/razorpay',{token});
  assert.equal(gateway.amount,online.total*100);
  const invalid={razorpay_order_id:gateway.orderId,razorpay_payment_id:'pay_fixture',razorpay_signature:'0'.repeat(64)};
  await call('/orders/'+online.orderNumber+'/razorpay/verify',{token,expected:400,body:invalid});
  assert.equal((await call('/orders/'+online.orderNumber+'/razorpay/reconcile',{token})).status,'PAID');
  const amount=Math.min(20,online.total);
  const refund=await call('/admin/orders/'+online.id+'/refund-request',{token:admin.token,expected:201,body:{amount,reason:'QA partial refund',requestKey:randomUUID()}});
  const initiated=await call('/admin/refunds/'+refund.id+'/razorpay',{token:admin.token});
  assert.equal(initiated.status,'PROCESSING');
  refundProcessed=true;
  const body=JSON.stringify({event:'refund.processed',payload:{refund:{entity:gatewayRefund}}});
  await call('/webhooks/razorpay',{body,expected:400,headers:{'x-razorpay-signature':'0'.repeat(64)}});
  for(let i=0;i<2;i++)await call('/webhooks/razorpay',{body,headers:{'x-razorpay-signature':hmac(body,process.env.RAZORPAY_WEBHOOK_SECRET)}});
  const order=await call('/orders/'+online.orderNumber,{token,method:'GET'});
  assert.equal(order.refunds[0].status,'REFUNDED');
  assert.equal(order.paymentStatus,'PAID');

  await call('/auth/logout',{token});
  await call('/auth/me',{token,method:'GET',expected:401});
  const another=await call('/auth/google',{body:{credential:credential(googleClient)}});
  await call('/auth/logout-all',{token:another.token});
  await call('/auth/me',{token:google.token,method:'GET',expected:401});
  console.log('PASS: guest merge, OTP, Google, session revocation, zones, two-store fulfilment, approvals, dispatch, delivery confirmation, settlement, coupons, stock watches, Razorpay reconciliation and refund webhook.');
} finally {
  await new Promise(resolve=>server.close(resolve));
  await prisma.$disconnect();
  globalThis.fetch=nativeFetch;
}
