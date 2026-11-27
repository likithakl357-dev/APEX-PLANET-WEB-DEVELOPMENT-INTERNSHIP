import { prisma } from './db.js';
import { auth } from './middleware/auth.js';
import { asyncHandler } from './utils/http.js';

export const publishNotification = (db, userId, title, message, href) =>
  db.notification.create({ data: { userId, title, message, href } });
export function registerNotifications(app) {
  app.get('/api/notifications', auth, asyncHandler(async(req,res) => res.json(await prisma.notification.findMany({
    where:{userId:req.user.id},orderBy:{createdAt:'desc'},take:50
  }))));
  app.post('/api/notifications/read', auth, asyncHandler(async(req,res) => {
    await prisma.notification.updateMany({where:{userId:req.user.id,readAt:null},data:{readAt:new Date()}});
    res.json({ok:true});
  }));
}
